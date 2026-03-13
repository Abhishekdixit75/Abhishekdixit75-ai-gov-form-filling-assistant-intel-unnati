import cv2

def preprocess(image_path):
    img = cv2.imread(image_path)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    denoised = cv2.GaussianBlur(gray, (5, 5), 0)
    return denoised


# the below written code, is just for testing the preprocess function for its grayscale processing

processed_image = preprocess("./data/pages/page_1.png")
output_path = "./data/pages/page_1_processed.png"
cv2.imwrite(output_path, processed_image)
print(f"Saved processed image to {output_path}")
