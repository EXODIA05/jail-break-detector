#!/usr/bin/env python3
"""
Automated 1-Click Deployment to Hugging Face Spaces.
Deploys the full stack (3D Landing Page, React 3D Playground, FastAPI ML Gateway)
to Hugging Face Spaces (100% Free Forever, 16GB RAM, 2 vCPUs, Persistent HTTPS).
"""
import os
import sys
from huggingface_hub import HfApi, create_repo, upload_folder

SPACE_NAME = os.getenv("HF_SPACE_NAME", "aegis-guardrail")

def deploy():
    print("==================================================")
    print(" 🚀 Deploying to Hugging Face Spaces (100% Free)")
    print("==================================================")

    token = os.getenv("HF_TOKEN") or None
    try:
        api = HfApi(token=token)
        user_info = api.whoami()
        username = user_info["name"]
        print(f"Authenticated as Hugging Face user: @{username}")
    except Exception as e:
        print(f"Authentication error: {e}")
        print("Please set HF_TOKEN with Write permission: export HF_TOKEN=hf_...")
        print("Create a token at: https://huggingface.co/settings/tokens")
        sys.exit(1)

    repo_id = f"{username}/{SPACE_NAME}"
    print(f"Target Space: {repo_id}")

    # 1. Create Space repository with Docker SDK
    print("\n[1/3] Creating/verifying Hugging Face Space repository...")
    created = False
    try:
        create_repo(
            repo_id=repo_id,
            repo_type="space",
            space_sdk="docker",
            private=False,
            exist_ok=True,
            token=token,
        )
        print("✓ Space repository ready.")
        created = True
    except Exception as e:
        err_msg = str(e)
        if "403" in err_msg or "Forbidden" in err_msg:
            print("\n⚠️ Notice: Your current token is fine-grained and does not have 'Write/Create' permissions.")
            print(f"Option A: Create the space in 1 click at: https://huggingface.co/new-space?name={SPACE_NAME}&sdk=docker")
            print("Option B: Generate a Write token at: https://huggingface.co/settings/tokens")
            print(f"          Then run: HF_TOKEN=hf_... python deploy_hf.py\n")
        else:
            print(f"Repository notice: {e}")

    # 2. Upload project files (excluding heavy training datasets and node_modules)
    print("\n[2/3] Uploading production assets to Hugging Face...")
    ignore_patterns = [
        "*.csv",
        "*.pyc",
        "__pycache__",
        "__pycache__/**",
        "frontend/node_modules/**",
        "landing/node_modules/**",
        "node_modules/**",
        ".venv/**",
        "venv/**",
        ".git/**",
        "logs/**",
        "*.pid",
        ".~lock.*",
        ".env",
    ]

    try:
        commit_url = upload_folder(
            folder_path=".",
            repo_id=repo_id,
            repo_type="space",
            ignore_patterns=ignore_patterns,
            commit_message="Deploy full-stack Aegis Guardrail Gateway (Docker)",
            token=token,
        )
        print("✓ Upload successfully committed.")
    except Exception as e:
        print(f"\n❌ Upload failed: {e}")
        print("\nQuick Resolution:")
        print(f"1. Create the Space at: https://huggingface.co/new-space?name={SPACE_NAME}&sdk=docker")
        print("2. Ensure your Hugging Face Token has 'Write' permission at: https://huggingface.co/settings/tokens")
        print(f"3. Run: HF_TOKEN=your_write_token python deploy_hf.py")
        sys.exit(1)

    # 3. Output deployment details
    space_web_url = f"https://{username}-{SPACE_NAME.replace('_', '-')}.hf.space"
    space_repo_url = f"https://huggingface.co/spaces/{repo_id}"

    print("\n[3/3] Deployment Pipeline Triggered!")
    print("==================================================")
    print(f" 📦 Space Console:  {space_repo_url}")
    print(f" 🌐 Live Public URL: {space_web_url}")
    print("==================================================")
    print("Hugging Face is building your container in the cloud.")
    print("It will be ready in ~1-2 minutes.")
    print("Your Space features:")
    print(" - 16 GB RAM + 2 vCPUs (100% Free Forever)")
    print(" - Zero sleep (24/7 uptime)")
    print(" - 🌐 3D Product Landing:   /")
    print(" - ✨ React 3D Playground:  /playground")
    print(" - 🛡️ Guardrail API:        /chat, /predict")
    print(" - 📡 Interactive Docs:     /docs")
    print("==================================================")

if __name__ == "__main__":
    deploy()
