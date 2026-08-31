"""Z-RevixDB Setup Configuration."""

from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

setup(
    name="zrevixdb",
    version="0.1.0",
    author="Z-RevixDB Contributors",
    description="Enterprise Data Versioning, Time-Travel & Recovery Platform",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/yourusername/zrevixdb",
    packages=find_packages(),
    classifiers=[
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Topic :: Database",
        "Topic :: Software Development :: Libraries",
    ],
    python_requires=">=3.9",
    entry_points={
        "console_scripts": [
            "zrevixdb=app:main",
        ],
    },
)
