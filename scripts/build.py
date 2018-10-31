import os
import shutil

try:
    shutil.rmtree("dist")
except FileNotFoundError:
    pass
finally:
    os.mkdir("dist")


shutil.copytree('src/icons', 'dist/icons')

os.mkdir('dist/popup')

for x in os.listdir('src/popup'):
    if not x.endswith("js"):
        shutil.copy(x, 'dist/popup')
    