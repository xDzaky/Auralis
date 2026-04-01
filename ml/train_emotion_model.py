import argparse
from pathlib import Path

import tensorflow as tf
from tensorflow.keras import layers, models
from tensorflow.keras.applications import MobileNetV2


IMG_SIZE = 64
BATCH_SIZE = 32
CLASS_NAMES = ['happy', 'sad', 'neutral', 'confused']


def build_dataset(dataset_dir, subset):
  directory = Path(dataset_dir) / subset
  return tf.keras.utils.image_dataset_from_directory(
    directory,
    image_size=(IMG_SIZE, IMG_SIZE),
    batch_size=BATCH_SIZE,
    label_mode='categorical',
    class_names=CLASS_NAMES,
    shuffle=subset == 'train',
  ).prefetch(tf.data.AUTOTUNE)


def build_model():
  base_model = MobileNetV2(
    input_shape=(IMG_SIZE, IMG_SIZE, 3),
    include_top=False,
    weights='imagenet',
  )
  base_model.trainable = False

  model = models.Sequential([
    layers.Input(shape=(IMG_SIZE, IMG_SIZE, 3)),
    layers.Rescaling(1.0 / 255),
    layers.RandomFlip('horizontal'),
    layers.RandomRotation(0.05),
    layers.RandomContrast(0.2),
    base_model,
    layers.GlobalAveragePooling2D(),
    layers.Dropout(0.3),
    layers.Dense(128, activation='relu'),
    layers.Dropout(0.2),
    layers.Dense(len(CLASS_NAMES), activation='softmax'),
  ])

  model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=1e-3),
    loss='categorical_crossentropy',
    metrics=['accuracy'],
  )

  return model, base_model


def main():
  parser = argparse.ArgumentParser()
  parser.add_argument('--dataset', required=True, help='Path ke folder dataset utama')
  parser.add_argument('--output', required=True, help='Output model .h5')
  parser.add_argument('--epochs-head', type=int, default=15)
  parser.add_argument('--epochs-finetune', type=int, default=20)
  args = parser.parse_args()

  train_ds = build_dataset(args.dataset, 'train')
  val_ds = build_dataset(args.dataset, 'val')
  test_ds = build_dataset(args.dataset, 'test')

  model, base_model = build_model()
  callbacks = [
    tf.keras.callbacks.EarlyStopping(patience=5, restore_best_weights=True),
    tf.keras.callbacks.ReduceLROnPlateau(factor=0.5, patience=3),
  ]

  model.fit(
    train_ds,
    validation_data=val_ds,
    epochs=args.epochs_head,
    callbacks=callbacks,
  )

  base_model.trainable = True
  for layer in base_model.layers[:100]:
    layer.trainable = False

  model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=1e-5),
    loss='categorical_crossentropy',
    metrics=['accuracy'],
  )

  model.fit(
    train_ds,
    validation_data=val_ds,
    epochs=args.epochs_finetune,
    callbacks=callbacks,
  )

  loss, accuracy = model.evaluate(test_ds)
  print({'test_loss': float(loss), 'test_accuracy': float(accuracy)})

  output_path = Path(args.output)
  output_path.parent.mkdir(parents=True, exist_ok=True)
  model.save(output_path)


if __name__ == '__main__':
  main()
