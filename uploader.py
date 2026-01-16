import subprocess
import tempfile
import os
import shutil

# ========== CONFIG ==========
REPO_PATH = r"C:\Users\dhiraj.kumar\Downloads\YtG"
UPLOAD_FOLDER = "videos"
# ===========================


def download_to_temp(url):
    temp_dir = tempfile.mkdtemp()
    output_path = os.path.join(temp_dir, "%(title)s.%(ext)s")

    print("Streaming to temp buffer...")

    cmd = [
        "yt-dlp",
        "-f", "bv*+ba/b",
        "--merge-output-format", "mp4",
        "-o", output_path,
        url
    ]

    subprocess.run(cmd, check=True)
    return temp_dir


def move_to_repo(temp_dir):
    files = os.listdir(temp_dir)
    if not files:
        raise Exception("No file downloaded")

    file_path = os.path.join(temp_dir, files[0])
    dest_dir = os.path.join(REPO_PATH, UPLOAD_FOLDER)
    os.makedirs(dest_dir, exist_ok=True)

    dest_path = os.path.join(dest_dir, files[0])
    shutil.move(file_path, dest_path)

    return dest_path


def git_lfs_upload(file_path):
    os.chdir(REPO_PATH)

    print("Uploading via Git LFS...")

    subprocess.run(["git", "add", ".gitattributes"], check=True)
    subprocess.run(["git", "add", file_path], check=True)

    subprocess.run(["git", "commit", "-m", "Add video via YouTube uploader"], check=True)
    subprocess.run(["git", "push"], check=True)


def main():
    url = input("Paste YouTube URL: ")

    temp_dir = download_to_temp(url)
    final_path = move_to_repo(temp_dir)
    git_lfs_upload(final_path)

    shutil.rmtree(temp_dir)

    print("\nUpload complete. Temp data cleaned.")


if __name__ == "__main__":
    main()
