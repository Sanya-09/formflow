import os
import re

def update_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    # Text colors
    content = re.sub(r'text-gray-900', 'text-text-primary', content)
    content = re.sub(r'text-gray-800', 'text-text-primary', content)
    content = re.sub(r'text-gray-700', 'text-text-secondary', content)
    content = re.sub(r'text-gray-600', 'text-text-secondary', content)
    content = re.sub(r'text-gray-500', 'text-text-muted', content)
    content = re.sub(r'text-gray-400', 'text-text-muted', content)
    
    # Backgrounds
    content = re.sub(r'bg-white', 'bg-card-bg', content)
    content = re.sub(r'bg-gray-50', 'bg-card-elevated', content)
    content = re.sub(r'bg-gray-100', 'bg-card-elevated', content)
    content = re.sub(r'bg-gray-800', 'bg-text-primary', content)
    content = re.sub(r'bg-gray-900', 'bg-text-primary', content)
    
    # Borders
    content = re.sub(r'border-gray-100', 'border-border-soft', content)
    content = re.sub(r'border-gray-200', 'border-border-soft', content)
    content = re.sub(r'border-gray-300', 'border-border-strong', content)
    content = re.sub(r'border-gray-400', 'border-border-strong', content)
    
    # Placeholders
    content = re.sub(r'placeholder-gray-400', 'placeholder-text-muted', content)
    content = re.sub(r'placeholder-gray-500', 'placeholder-text-muted', content)
    
    # Hover states
    content = re.sub(r'hover:bg-gray-50', 'hover:bg-card-elevated', content)
    content = re.sub(r'hover:bg-gray-100', 'hover:bg-card-elevated', content)
    content = re.sub(r'hover:bg-gray-800', 'hover:opacity-90', content)
    content = re.sub(r'hover:text-gray-900', 'hover:text-text-primary', content)
    content = re.sub(r'hover:text-gray-700', 'hover:text-text-primary', content)
    content = re.sub(r'hover:border-gray-300', 'hover:border-border-strong', content)
    
    # Previous custom tokens that need migration
    content = re.sub(r'text-ink-dark', 'text-text-primary', content)
    content = re.sub(r'bg-ink-dark', 'bg-text-primary', content)
    content = re.sub(r'text-primary-dark', 'text-primary-hover', content)
    
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")

def main():
    for root, dirs, files in os.walk('frontend'):
        if 'node_modules' in dirs:
            dirs.remove('node_modules')
        if '.next' in dirs:
            dirs.remove('.next')
        
        for file in files:
            if file.endswith(('.tsx', '.ts')):
                update_file(os.path.join(root, file))

if __name__ == "__main__":
    main()
