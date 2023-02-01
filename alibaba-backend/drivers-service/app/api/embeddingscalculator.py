import os
import cv2
import tensorflow as tf
from mtcnn import MTCNN
import sys
sys.path.append(os.getcwd()+'/app/assets')


class EmbeddingsCalculator:

    def __init__(self):

        self.detector = MTCNN()
        path_to_use = '/app/app/assets/facenet.tflite'
        print(f"Tensorflow: {os.path.exists(path_to_use)}, {path_to_use}, {os.getcwd()}")
        tfl_file = path_to_use
        self.tflite_model = self.load_tflite_model(tfl_file)

    def crop_bb(self, img):
        data = self.detector.detect_faces(img)
        cropped = None
        if len(data) > 0:
            bbox = None

            for i, faces in enumerate(data):  # iterate through all the faces found
                box = faces['box']  # get the box for each face
                biggest = 0
                area = box[3] * box[2]
                if area > biggest:
                    biggest = area
                    bbox = box
            bbox[0] = 0 if bbox[0] < 0 else bbox[0]
            bbox[1] = 0 if bbox[1] < 0 else bbox[1]
            cropped = img[bbox[1]: bbox[1] + bbox[3], bbox[0]: bbox[0] + bbox[2]]

        return cropped

    def read_image(self, file):
        img = cv2.imread(file)
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        return img

    def pre_process(self, face, required_size=(160, 160)):
        ret = cv2.resize(face, (160, 160))
        ret = ret.astype('float32')
        mean, std = ret.mean(), ret.std()
        ret = (ret - mean) / std

        return ret

    def load_tflite_model(self, file):
        # Load the TFLite model and allocate tensors.
        interpreter = tf.lite.Interpreter(model_path=file)
        interpreter.allocate_tensors()
        return interpreter

    def predict(self, face_model, sample):
        input_details = face_model.get_input_details()
        output_details = face_model.get_output_details()
        input_shape = input_details[0]['shape']
        input_data = sample.reshape(input_shape)
        face_model.set_tensor(input_details[0]['index'], input_data)
        face_model.invoke()
        output_data = face_model.get_tensor(output_details[0]['index'])
        return output_data

    # load tfl model
    def calculate_embedding(self, img_obj):
        cropped_img = self.crop_bb(img_obj)
        preprocessed_image = self.pre_process(cropped_img)
        embedding = self.predict(self.tflite_model, preprocessed_image)
        return embedding


if __name__ == '__main__':
    BB = EmbeddingsCalculator()



