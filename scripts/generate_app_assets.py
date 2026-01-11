#!/usr/bin/env python3
"""
Generate app logo and splash screen for Capacitor Android/iOS builds.
Uses the same 'Liquids' font as the website topbar/footer with pink branding.
"""

import os
import sys

# Check for PIL/Pillow
try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    print("Installing Pillow...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow"])
    from PIL import Image, ImageDraw, ImageFont

# Paths
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
PUBLIC_DIR = os.path.join(PROJECT_ROOT, "public")

# Font path
FONT_TTF = os.path.join(PUBLIC_DIR, "fonts", "Liquids.ttf")
FONT_OTF = os.path.join(PUBLIC_DIR, "fonts", "Liquids.otf")
FONT_PATH = FONT_TTF if os.path.exists(FONT_TTF) else FONT_OTF

# Output directories
APP_ICONS_DIR = os.path.join(PUBLIC_DIR, "app-icons")
ANDROID_RES_DIR = os.path.join(PROJECT_ROOT, "android", "app", "src", "main", "res")

# Brand colors (from the website's pink gradient)
PINK_GRADIENT_START = (255, 107, 160)  # #FF6BA0
PINK_GRADIENT_END = (255, 89, 115)     # #FF5973
PINK_PRIMARY = (255, 89, 115)          # #FF5973 - main pink
WHITE = (255, 255, 255)
TRANSPARENT = (0, 0, 0, 0)

# App icon sizes for Android
ANDROID_ICON_SIZES = {
    "mipmap-mdpi": 48,
    "mipmap-hdpi": 72,
    "mipmap-xhdpi": 96,
    "mipmap-xxhdpi": 144,
    "mipmap-xxxhdpi": 192,
}

# Splash screen sizes
SPLASH_SIZES = {
    "port-mdpi": (320, 480),
    "port-hdpi": (480, 800),
    "port-xhdpi": (720, 1280),
    "port-xxhdpi": (960, 1600),
    "port-xxxhdpi": (1280, 1920),
    "land-mdpi": (480, 320),
    "land-hdpi": (800, 480),
    "land-xhdpi": (1280, 720),
    "land-xxhdpi": (1600, 960),
    "land-xxxhdpi": (1920, 1280),
}


def create_gradient_background(size, start_color, end_color, direction='vertical'):
    """Create a gradient background image."""
    width, height = size
    img = Image.new('RGBA', (width, height), WHITE + (255,))
    draw = ImageDraw.Draw(img)
    
    for i in range(height if direction == 'vertical' else width):
        ratio = i / (height if direction == 'vertical' else width)
        r = int(start_color[0] + (end_color[0] - start_color[0]) * ratio)
        g = int(start_color[1] + (end_color[1] - start_color[1]) * ratio)
        b = int(start_color[2] + (end_color[2] - start_color[2]) * ratio)
        
        if direction == 'vertical':
            draw.line([(0, i), (width, i)], fill=(r, g, b, 255))
        else:
            draw.line([(i, 0), (i, height)], fill=(r, g, b, 255))
    
    return img


def create_app_icon(size, text="S", bg_color=WHITE, text_color=PINK_PRIMARY):
    """Create an app icon with the Liquids font - white bg, pink text."""
    img = Image.new('RGBA', (size, size), TRANSPARENT)
    draw = ImageDraw.Draw(img)
    
    # White background with rounded corners
    bg = bg_color + (255,)
    padding = int(size * 0.08)
    corner_radius = int(size * 0.22)
    
    # Draw rounded rectangle
    draw.rounded_rectangle(
        [padding, padding, size - padding, size - padding],
        radius=corner_radius,
        fill=bg
    )
    
    # Load font
    try:
        font_size = int(size * 0.55)
        font = ImageFont.truetype(FONT_PATH, font_size)
    except Exception as e:
        print(f"Warning: Could not load Liquids font ({e}), using default")
        font = ImageFont.load_default()
    
    # Draw text perfectly centered (pink on white)
    # Use textbbox to get actual rendered dimensions
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    # Calculate center position, accounting for bbox offset
    x = (size - text_width) // 2 - bbox[0]
    y = (size - text_height) // 2 - bbox[1]
    
    draw.text((x, y), text, font=font, fill=text_color + (255,))
    
    return img


def create_app_icon_full(size, text="SPYLL"):
    """Create an app icon with full SPYLL text - white bg, pink text, centered."""
    img = Image.new('RGBA', (size, size), TRANSPARENT)
    draw = ImageDraw.Draw(img)
    
    # White background with rounded corners
    bg = WHITE + (255,)
    padding = int(size * 0.08)
    corner_radius = int(size * 0.22)
    
    draw.rounded_rectangle(
        [padding, padding, size - padding, size - padding],
        radius=corner_radius,
        fill=bg
    )
    
    # Load font - sized to fit nicely
    try:
        font_size = int(size * 0.32)
        font = ImageFont.truetype(FONT_PATH, font_size)
    except Exception as e:
        print(f"Warning: Could not load Liquids font ({e}), using default")
        font = ImageFont.load_default()
    
    # Draw text perfectly centered horizontally and vertically (pink on white)
    # Use textbbox to get actual rendered dimensions
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    # Calculate center position, accounting for bbox offset (fixes vertical alignment)
    x = (size - text_width) // 2 - bbox[0]
    y = (size - text_height) // 2 - bbox[1]
    
    draw.text((x, y), text, font=font, fill=PINK_PRIMARY + (255,))
    
    return img


def create_splash_screen(size, text="SPYLL"):
    """Create a splash screen with centered SPYLL text on white background."""
    width, height = size
    img = Image.new('RGBA', (width, height), WHITE + (255,))
    draw = ImageDraw.Draw(img)
    
    # Load font - larger for splash
    try:
        font_size = min(width, height) // 4
        font = ImageFont.truetype(FONT_PATH, font_size)
    except Exception as e:
        print(f"Warning: Could not load Liquids font ({e}), using default")
        font = ImageFont.load_default()
    
    # Draw text centered in pink (accounting for bbox offset for true centering)
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    x = (width - text_width) // 2 - bbox[0]
    y = (height - text_height) // 2 - bbox[1]
    
    draw.text((x, y), text, font=font, fill=PINK_PRIMARY + (255,))
    
    return img


def ensure_dir(path):
    """Create directory if it doesn't exist."""
    os.makedirs(path, exist_ok=True)


def generate_android_icons():
    """Generate all Android app icons."""
    print("\n📱 Generating Android app icons...")
    
    for density, size in ANDROID_ICON_SIZES.items():
        # Create directory
        icon_dir = os.path.join(ANDROID_RES_DIR, density)
        ensure_dir(icon_dir)
        
        # Generate launcher icon with full "SPYLL" text
        icon = create_app_icon_full(size, "SPYLL")
        icon_path = os.path.join(icon_dir, "ic_launcher.png")
        icon.save(icon_path, "PNG")
        print(f"  ✓ {density}/ic_launcher.png ({size}x{size})")
        
        # Generate round icon (same as regular for now)
        round_icon_path = os.path.join(icon_dir, "ic_launcher_round.png")
        icon.save(round_icon_path, "PNG")
        print(f"  ✓ {density}/ic_launcher_round.png ({size}x{size})")
        
        # Generate foreground for adaptive icons
        foreground = create_app_icon_full(size, "SPYLL")
        foreground_path = os.path.join(icon_dir, "ic_launcher_foreground.png")
        foreground.save(foreground_path, "PNG")
        print(f"  ✓ {density}/ic_launcher_foreground.png ({size}x{size})")


def generate_android_splash():
    """Generate Android splash screens."""
    print("\n🎨 Generating Android splash screens...")
    
    for name, size in SPLASH_SIZES.items():
        # Determine drawable directory
        if name.startswith("port-"):
            density = name.replace("port-", "")
            drawable_dir = os.path.join(ANDROID_RES_DIR, f"drawable-{density}")
        else:
            density = name.replace("land-", "")
            drawable_dir = os.path.join(ANDROID_RES_DIR, f"drawable-land-{density}")
        
        ensure_dir(drawable_dir)
        
        # Generate splash
        splash = create_splash_screen(size, "SPYLL")
        splash_path = os.path.join(drawable_dir, "splash.png")
        splash.save(splash_path, "PNG")
        print(f"  ✓ {os.path.basename(drawable_dir)}/splash.png ({size[0]}x{size[1]})")


def generate_public_assets():
    """Generate assets for public folder."""
    print("\n🌐 Generating public assets...")
    
    ensure_dir(APP_ICONS_DIR)
    
    # Generate various sizes for PWA/web
    web_sizes = [16, 32, 72, 96, 128, 144, 152, 192, 384, 512]
    
    for size in web_sizes:
        icon = create_app_icon_full(size, "SPYLL")
        icon_path = os.path.join(APP_ICONS_DIR, f"icon-{size}x{size}.png")
        icon.save(icon_path, "PNG")
        print(f"  ✓ icon-{size}x{size}.png")
    
    # Generate favicon
    favicon = create_app_icon_full(32, "SPYLL")
    favicon_path = os.path.join(PUBLIC_DIR, "favicon.ico")
    favicon.save(favicon_path, "ICO")
    print(f"  ✓ favicon.ico")
    
    # Generate apple-touch-icon
    apple_icon = create_app_icon_full(180, "SPYLL")
    apple_icon_path = os.path.join(PUBLIC_DIR, "apple-touch-icon.png")
    apple_icon.save(apple_icon_path, "PNG")
    print(f"  ✓ apple-touch-icon.png")
    
    # Generate OG image (for social sharing)
    og_image = create_splash_screen((1200, 630), "SPYLL")
    og_path = os.path.join(APP_ICONS_DIR, "og-image.png")
    og_image.save(og_path, "PNG")
    print(f"  ✓ og-image.png (1200x630)")


def generate_ios_assets():
    """Generate iOS app icons."""
    print("\n🍎 Generating iOS assets...")
    
    ios_dir = os.path.join(PROJECT_ROOT, "ios", "App", "App", "Assets.xcassets", "AppIcon.appiconset")
    
    if not os.path.exists(os.path.dirname(ios_dir)):
        print("  ⚠ iOS directory not found, skipping iOS assets")
        return
    
    ensure_dir(ios_dir)
    
    # iOS icon sizes
    ios_sizes = [
        (20, 1), (20, 2), (20, 3),
        (29, 1), (29, 2), (29, 3),
        (40, 1), (40, 2), (40, 3),
        (60, 2), (60, 3),
        (76, 1), (76, 2),
        (83.5, 2),
        (1024, 1),
    ]
    
    contents = {
        "images": [],
        "info": {"author": "xcode", "version": 1}
    }
    
    for base_size, scale in ios_sizes:
        size = int(base_size * scale)
        icon = create_app_icon_full(size, "SPYLL")
        filename = f"icon-{base_size}@{scale}x.png"
        icon_path = os.path.join(ios_dir, filename)
        icon.save(icon_path, "PNG")
        print(f"  ✓ {filename} ({size}x{size})")
        
        contents["images"].append({
            "filename": filename,
            "idiom": "universal",
            "platform": "ios",
            "size": f"{base_size}x{base_size}",
            "scale": f"{scale}x"
        })
    
    # Write Contents.json
    import json
    contents_path = os.path.join(ios_dir, "Contents.json")
    with open(contents_path, 'w') as f:
        json.dump(contents, f, indent=2)
    print(f"  ✓ Contents.json")


def main():
    """Main entry point."""
    print("=" * 60)
    print("🎨 SPYLL App Asset Generator")
    print("=" * 60)
    print(f"\nFont path: {FONT_PATH}")
    print(f"Font exists: {os.path.exists(FONT_PATH)}")
    print(f"Project root: {PROJECT_ROOT}")
    
    if not os.path.exists(FONT_PATH):
        print(f"\n❌ Error: Font file not found at {FONT_PATH}")
        print("Please ensure Liquids.ttf or Liquids.otf exists in public/fonts/")
        sys.exit(1)
    
    # Generate all assets
    generate_android_icons()
    generate_android_splash()
    generate_public_assets()
    generate_ios_assets()
    
    print("\n" + "=" * 60)
    print("✅ All assets generated successfully!")
    print("=" * 60)
    print("\nNext steps:")
    print("1. Run 'npx cap sync android' to sync assets")
    print("2. Rebuild the APK with './gradlew assembleDebug'")


if __name__ == "__main__":
    main()
