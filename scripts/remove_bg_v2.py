from PIL import Image, ImageDraw
import os

def remove_white_bg_flood(input_path, output_path, tolerance=30):
    try:
        img = Image.open(input_path).convert("RGBA")
        width, height = img.size
        
        # Get the background color from the top-left corner
        bg_color = img.getpixel((0, 0))
        
        # Function to check if a pixel is similar to the background color
        def is_similar(p1, p2, tol):
            return abs(p1[0] - p2[0]) <= tol and \
                   abs(p1[1] - p2[1]) <= tol and \
                   abs(p1[2] - p2[2]) <= tol

        # Create a mask for the background
        # We'll use a queue for flood fill (BFS)
        queue = [(0, 0), (width-1, 0), (0, height-1), (width-1, height-1)] # Start from all corners
        visited = set(queue)
        pixels = img.load()
        
        # Create a new completely transparent image for output
        # properly formatted to preserve the original image where not background
        
        # Simpler approach: Manipulate the alpha channel directly of the original image
        
        while queue:
            x, y = queue.pop(0)
            current_color = pixels[x, y]
            
            if is_similar(current_color, bg_color, tolerance):
                pixels[x, y] = (current_color[0], current_color[1], current_color[2], 0) # Make transparent
                
                # Check neighbors
                for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < width and 0 <= ny < height and (nx, ny) not in visited:
                        visited.add((nx, ny))
                        queue.append((nx, ny))
                        
        img.save(output_path, "PNG")
        print(f"Processed: {input_path} -> {output_path}")
        
    except Exception as e:
        print(f"Error processing {input_path}: {e}")

if __name__ == "__main__":
    current_dir = os.getcwd()
    print(f"Working directory: {current_dir}")

    files = [
        ("public/baby_hippo.png", "public/baby_hippo_v3.png"),
        ("public/baby_penguin.png", "public/baby_penguin_v3.png"),
        ("public/cookie.png", "public/cookie_v3.png")
    ]
    
    for input_f, output_f in files:
        full_input = os.path.join(current_dir, input_f)
        full_output = os.path.join(current_dir, output_f)
        
        if os.path.exists(full_input):
            remove_white_bg_flood(full_input, full_output, tolerance=50) # Increased tolerance
        else:
            print(f"File not found: {full_input}")
