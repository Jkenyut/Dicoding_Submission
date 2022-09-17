# -*- coding: utf-8 -*-
"""Dicoding image Tflite intermidiate.ipynb

Automatically generated by Colaboratory.

Original file is located at
    https://colab.research.google.com/drive/1ewoEJverPWy8sCQvSEddq09OR8ZT28WY

## Satria Nur Saputro
# Dicoding NLP
# Dataset [Click me](https://www.kaggle.com/datasets/alessiocorrado99/animals10?select=raw-img)

download data
"""

!wget "https://storage.googleapis.com/kaggle-data-sets/59760/840806/bundle/archive.zip?X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Credential=gcp-kaggle-com%40kaggle-161607.iam.gserviceaccount.com%2F20220911%2Fauto%2Fstorage%2Fgoog4_request&X-Goog-Date=20220911T173418Z&X-Goog-Expires=259200&X-Goog-SignedHeaders=host&X-Goog-Signature=29a75647bc1b42c77cdc657909a2f21339ef0b33a6705da1f8186ecde4c392e3070f9d517c59c586d6b0072397594d21cb7a06f18e45ef6602c89f32565cce4507c114831236ecbaa337dccfd8e71aa5cc02dba7ab5eae26a0787876f6f3244d2ef3d60be8fe615c72948176b5034b738ebc86f6ab109689bce14eeecb1028fc8cd53621a7921ef1c1c8c91cb5ac149d7ef32f90c8c6af845ac71566a361e934a2dd7db2adc79a05c522a81d9b6ec1a56f6f5d38d34c21b8a941786a2a1f39c3ceea2e8724959e870b56d53e77c9d0812a4edd63d7e4478734b605f8285aef71da618382f25e98cbd264451f69b4c07e2a8db4d97ddfd276936af816b71541cc"

"""Unzip data"""

!unzip "/content/dataset.zip"

"""# Import libary"""

import numpy as np
import pandas as pd
import os
import tensorflow as tf

"""# Preprocessing"""

data_dir = '/content/raw-img'
image_size = (224, 224)
batch_size = 4
train_generator = tf.keras.utils.image_dataset_from_directory(
  data_dir,
  subset="training",
  validation_split=0.2,
  seed=1337,
  image_size=image_size,
  batch_size=batch_size
  )

val_generator = tf.keras.utils.image_dataset_from_directory(
  data_dir,
  subset="validation",
  validation_split=0.2,
  seed=1337,
  image_size=image_size,
  batch_size=batch_size
  )

class_names = train_generator.class_names
print(class_names)

"""#Xception"""

from tensorflow.keras.applications import Xception
from tensorflow.keras.models import Sequential
from tensorflow.keras import backend
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.layers import Input, Conv2D, MaxPooling2D, GlobalAveragePooling2D, BatchNormalization
from tensorflow.keras.layers import Dense, Dropout, Flatten, Activation, Concatenate, Lambda
from tensorflow.keras.models import Model
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau, ModelCheckpoint
from tensorflow.keras.optimizers import Adam
from tensorflow.keras import regularizers, activations
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers

data_augmentation = keras.Sequential(
    [
        layers.RandomFlip("horizontal",
        input_shape=(224,224)+
                                  (3,)),
        layers.RandomRotation(0.1),
    ]
)

Xception = tf.keras.applications.Xception(include_top= False,weights="imagenet", input_shape=(224,224,3))
for layer in Xception.layers:
	layer.trainable = False

model = tf.keras.models.Sequential([
    data_augmentation,
    layers.Rescaling(1.0 / 255),
    Xception,
    tf.keras.layers.Conv2D(128, (3,3), padding='same', activation='relu'),
    tf.keras.layers.MaxPooling2D(),
    tf.keras.layers.Conv2D(512, (3,3), padding='same', activation='relu'),
    tf.keras.layers.MaxPooling2D(),
    tf.keras.layers.BatchNormalization(),
     tf.keras.layers.GlobalAveragePooling2D(),
    tf.keras.layers.Dropout(0.5),  
    tf.keras.layers.Dense(256, activation='relu'),
    tf.keras.layers.Dense(10, activation='softmax')  
])
model.summary()

"""# Optimizer and loss"""

optimizers = keras.optimizers.Adam(3e-4)
model.compile(loss=tf.keras.losses.SparseCategoricalCrossentropy(from_logits=True),
              optimizer=optimizers,
              metrics=['accuracy'])

class callback(keras.callbacks.Callback):
  def on_epoch_end(self, epoch, logs={}):
    if(logs.get('accuracy') > 0.94):
      self.model.stop_training = True

callbacks = callback()
early_stopping = keras.callbacks.EarlyStopping(monitor='val_loss',mode="max", patience=20)

"""# Training"""

num_epochs = 200
history = model.fit( train_generator, epochs=num_epochs, callbacks=[callbacks,early_stopping],
                    validation_data = val_generator, batch_size=4,verbose=2)

"""# Visualisasi"""

import matplotlib.pyplot as plt
plt.plot(history.history['accuracy'])
plt.plot(history.history['val_accuracy'])
plt.title('Akurasi Model')
plt.ylabel('accuracy')
plt.xlabel('epoch')
plt.legend(['train', 'test'], loc='upper left')
plt.show()

plt.plot(history.history['loss'])
plt.plot(history.history['val_loss'])
plt.title('Loss Model')
plt.ylabel('loss')
plt.xlabel('epoch')
plt.legend(['train', 'test'], loc='upper left')
plt.show()

"""# Konversi ke tf lite"""

converter = tf.lite.TFLiteConverter.from_keras_model(model)
tflite_model = converter.convert()

with tf.io.gfile.GFile('model.tflite', 'wb') as f:
  f.write(tflite_model)

!ls -la | grep 'model'