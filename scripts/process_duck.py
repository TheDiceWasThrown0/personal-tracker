from PIL import Image
import os

def remove_bg(input_path, output_path, tolerance=30):
    try:
        img = Image.open(input_path).convert("RGBA")
        datas = img.getdata()
        
        newData = []
        # Get the corner color (background)
        bg_pixel = img.getpixel((0, 0))
        
        for item in datas:
            # Simple distance check for background removal
            if abs(item[0] - bg_pixel[0]) < tolerance and \
               abs(item[1] - bg_pixel[1]) < tolerance and \
               abs(item[2] - bg_pixel[2]) < tolerance:
                newData.append((255, 255, 255, 0)) # Transparent
            else:
                newData.append(item)
        
        img.putdata(newData)
        img.save(output_path, "PNG")
        print(f"Saved to {output_path}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    input_file = "public/duck_w_knife.png"
    output_file = "public/duck_w_knife_transparent.png"
    
    if os.path.exists(input_file):
        remove_bg(input_file, output_file, tolerance=50)
    else:
        print(f"Input file not found: {input_file}")
