#!/usr/bin/env python3
import argparse
import asyncio
import json
import signal
from pathlib import Path
from urllib.parse import urlparse

from camoufox import DefaultAddons
from camoufox.async_api import AsyncCamoufox


def parse_proxy(proxy_url: str | None):
    if not proxy_url:
        return None
    parsed = urlparse(proxy_url)
    if not parsed.scheme or not parsed.hostname or not parsed.port:
        return None
    proxy = {"server": f"{parsed.scheme}://{parsed.hostname}:{parsed.port}"}
    if parsed.username:
        proxy["username"] = parsed.username
    if parsed.password:
        proxy["password"] = parsed.password
    return proxy


def normalize_cookie(cookie):
    if not cookie.get("name") or cookie.get("value") is None:
        return None
    return {
        "name": str(cookie["name"]),
        "value": str(cookie["value"]),
        "domain": cookie.get("domain", ".wplace.live"),
        "path": cookie.get("path", "/"),
        "secure": bool(cookie.get("secure", True)),
        "httpOnly": bool(cookie.get("httpOnly", True)),
        "sameSite": cookie.get("sameSite", "Lax"),
        "expires": int(cookie.get("expires", -1)),
    }


async def launch_user(user, extension_path: Path, stop_evt: asyncio.Event):
    name = user.get("name") or user.get("userId")
    proxy = parse_proxy(user.get("proxy"))
    cookies = [c for c in (normalize_cookie(c) for c in user.get("cookies", [])) if c]

    print(f"[fleet] launching {name} with proxy={user.get('proxy') or 'none'}")

    browser = AsyncCamoufox(
        headless=False,
        block_images=False,
        disable_coop=True,
        i_know_what_im_doing=True,
        exclude_addons=[DefaultAddons.UBO],
        addons=[str(extension_path)],
        proxy=proxy,
    )

    instance = await browser.start()
    context = await instance.new_context()

    if cookies:
        await context.add_cookies(cookies)

    page = await context.new_page()
    await page.goto("https://wplace.live/", wait_until="domcontentloaded")

    try:
        await stop_evt.wait()
    finally:
        await context.close()
        await instance.close()


async def run(payload_path: Path):
    extension_path = Path(__file__).resolve().parent.parent / "LOAD_UNPACKED"
    if not extension_path.exists():
        raise FileNotFoundError(f"Extension folder not found: {extension_path}")

    payload = json.loads(payload_path.read_text(encoding="utf-8"))
    users = payload.get("users", [])
    if not users:
        print("[fleet] no users provided; exiting")
        return

    stop_evt = asyncio.Event()
    loop = asyncio.get_running_loop()

    def _stop(*_):
        stop_evt.set()

    for sig in (signal.SIGINT, signal.SIGTERM):
        try:
            loop.add_signal_handler(sig, _stop)
        except NotImplementedError:
            pass

    tasks = [asyncio.create_task(launch_user(user, extension_path, stop_evt)) for user in users]
    done, pending = await asyncio.wait(tasks, return_when=asyncio.FIRST_EXCEPTION)

    for task in done:
        exc = task.exception()
        if exc:
            print(f"[fleet] error: {exc}")
            stop_evt.set()

    if pending:
        await asyncio.gather(*pending, return_exceptions=True)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--payload", required=True)
    args = parser.parse_args()
    asyncio.run(run(Path(args.payload)))
