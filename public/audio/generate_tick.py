import numpy as np
from scipy.io.wavfile import write

# Parameters for the tick sound
sample_rate = 44100  # CD-quality sample rate
duration = 0.05  # 50 ms tick sound
frequency = 1000  # Frequency of the tick in Hz

# Generate the tick sound wave
t = np.linspace(0, duration, int(sample_rate * duration), False)
wave = 0.5 * np.sin(2 * np.pi * frequency * t)

# Fade out to avoid clicking noise
fade_duration = 0.005  # 5 ms fade out
fade_samples = int(fade_duration * sample_rate)
fade_out = np.linspace(1, 0, fade_samples)
wave[-fade_samples:] *= fade_out

# Save the wave to a .wav file
file_path = "/mnt/data/tick_sound.wav"
write(file_path, sample_rate, wave.astype(np.float32))

file_path