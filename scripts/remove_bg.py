from PIL import Image
import os

def remove_white_bg(input_path, threshold=200):
    try:
        img = Image.open(input_path).convert("RGBA")
        datas = img.getdata()

        newData = []
        for item in datas:
            # Check if pixel is white-ish (R, G, B all above threshold)
            if item[0] > threshold and item[1] > threshold and item[2] > threshold:
                newData.append((255, 255, 255, 0))  # Transparent
            else:
                newData.append(item)

        img.putdata(newData)
        img.save(input_path, "PNG")
        print(f"Successfully processed: {input_path}")
    except Exception as e:
        print(f"Error processing {input_path}: {e}")

if __name__ == "__main__":
    files = [
        "public/baby_hippo.png",
        "public/baby_penguin.png",
        "public/cookie.png"
    ]
    
    current_dir = os.getcwd()
    print(f"Working directory: {current_dir}")
    
    for f in files:
        full_path = os.path.join(current_dir, f)
        if os.path.exists(full_path):
            remove_white_bg(full_path)
        else:
            print(f"File not found: {full_path}")
