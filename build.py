import os
import shutil
import subprocess

try:
    shutil.rmtree("dist/")
except FileNotFoundError:
    pass
finally:
    shutil.copytree("src", "dist/sorted")
    subprocess.run("tsc")
    shutil.rmtree("dist/sorted/popup/js")

    
