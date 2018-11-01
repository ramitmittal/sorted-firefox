import os
import shutil
import subprocess
import sys

if sys.version_info < (3,5):
    print("Need python3 to build. Exiting")
    sys.exit(1)


try:
    shutil.rmtree("dist/")
except FileNotFoundError:
    pass
finally:
    shutil.copytree("src", "dist/sorted")
    subprocess.run("tsc")
    shutil.rmtree("dist/sorted/popup/js")

    
