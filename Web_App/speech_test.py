from transformers import AutoProcessor, BarkModel
import scipy
import time

# Start the timer
start_time = time.time()

processor = AutoProcessor.from_pretrained("suno/bark")
model = BarkModel.from_pretrained("suno/bark")

voice_preset = "v2/en_speaker_6"
# voice_preset = "v2/zh_speaker_4" # Chinese Female Voice

# inputs = processor("Hello. 你好我的名字是丹尼尔.", voice_preset=voice_preset)
inputs = processor("Wow! Daniel is the biggest cutie patootie? [laughs]", voice_preset=voice_preset)

audio_array = model.generate(**inputs)
audio_array = audio_array.cpu().numpy().squeeze() # Can use CPU or GPU

sample_rate = model.generation_config.sample_rate
scipy.io.wavfile.write("bark_out.wav", rate=sample_rate, data=audio_array)

# End the timer
end_time = time.time()

# Calculate the elapsed time
elapsed_time = end_time - start_time
print(f"Execution time: {elapsed_time:.2f} seconds")