import cv2
import numpy as np

class LayoutAgent:
    def extract(self, image_path):
        img = cv2.imread(image_path)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        h, w = gray.shape

        # simple projection profile to estimate text density
        left_density = np.sum(gray[:, :w//3] < 200)
        right_density = np.sum(gray[:, 2*w//3:] < 200)

        photo_region = "left" if left_density < right_density else "right"

        return {
            "agent": "layout_agent",
            "modality": "layout",
            "rotation": 0,              # rotation already handled earlier
            "photo_region": photo_region,
            "layout": "horizontal"
        }

if __name__ == "__main__":
    agent = LayoutAgent()
    print(agent.extract("./data/pages/image.png"))