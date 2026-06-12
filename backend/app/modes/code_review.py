import os
try:
    from unidiff import PatchSet
except ImportError:
    pass

def parse_diff(file_path: str) -> list[str]:
    """
    Parses a unified diff or .patch file into chunks of file changes.
    Returns a list of strings, each representing the changes in one file.
    """
    try:
        patch = PatchSet.from_filename(file_path, encoding='utf-8')
        chunks = []
        for patched_file in patch:
            if patched_file.is_binary_file:
                continue
                
            # Create a summary chunk for this file
            file_summary = f"File: {patched_file.path}\n"
            if patched_file.is_added_file:
                file_summary += "Action: Added\n"
            elif patched_file.is_removed_file:
                file_summary += "Action: Deleted\n"
            elif patched_file.is_modified_file:
                file_summary += "Action: Modified\n"
                
            file_summary += f"Added lines: {patched_file.added}, Deleted lines: {patched_file.removed}\n\n"
            
            # Add hunks
            for hunk in patched_file:
                file_summary += f"@@ -{hunk.source_start},{hunk.source_length} +{hunk.target_start},{hunk.target_length} @@\n"
                for line in hunk:
                    if line.is_added:
                        file_summary += f"+ {line.value}"
                    elif line.is_removed:
                        file_summary += f"- {line.value}"
                    else:
                        file_summary += f"  {line.value}"
                        
            chunks.append(file_summary)
            
        return chunks
    except Exception as e:
        return [f"Error parsing diff: {str(e)}"]
