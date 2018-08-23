from random import randint
import time
for x in range(3000):
  randomNumber = str(randint(0, 1024));
  print(randomNumber)
  time.sleep(.1);
print
