Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "C:\Users\Rahul\Desktop\lekhak"
WshShell.Run "cmd /c npm run dev", 0, False
