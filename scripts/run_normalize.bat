@echo off
cd /d C:\Users\wjsrk\Desktop\progearmatch
echo === Run started: %date% %time% === >> normalize_apply.log
node scripts\normalize_gear_names.mjs --apply >> normalize_apply.log 2>&1
echo === Run finished: %date% %time% === >> normalize_apply.log
