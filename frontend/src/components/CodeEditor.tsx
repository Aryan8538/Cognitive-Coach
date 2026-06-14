"use client";

import { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import { Code2, RefreshCw, Copy, Check } from "lucide-react";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  onLanguageChange: (lang: string) => void;
}

const LANGUAGES = [
  { value: "python", label: "Python 3" },
  { value: "javascript", label: "JavaScript" },
  { value: "cpp", label: "C++ (GCC)" },
  { value: "java", label: "Java 17" }
];

const TEMPLATES: Record<string, string> = {
  python: 'def solve(nums, target):\n    # Write your algorithmic solution here\n    # Example: Complement lookup in hash map\n    seen = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in seen:\n            return [seen[complement], i]\n        seen[num] = i\n    return []\n',
  javascript: 'function solve(nums, target) {\n    // Write your algorithmic solution here\n    const seen = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        const complement = target - nums[i];\n        if (seen.has(complement)) {\n            return [seen.get(complement), i];\n        }\n        seen.set(nums[i], i);\n    }\n    return [];\n}\n',
  cpp: '#include <vector>\n#include <unordered_map>\n\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> solve(vector<int>& nums, int target) {\n        unordered_map<int, int> seen;\n        for (int i = 0; i < nums.size(); ++i) {\n            int complement = target - nums[i];\n            if (seen.count(complement)) {\n                return {seen[complement], i};\n            }\n            seen[nums[i]] = i;\n        }\n        return {};\n    }\n};\n',
  java: 'import java.util.HashMap;\nimport java.util.Map;\n\nclass Solution {\n    public int[] solve(int[] nums, int target) {\n        Map<Integer, Integer> seen = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int complement = target - nums[i];\n            if (seen.containsKey(complement)) {\n                return new int[] { seen.get(complement), i };\n            }\n            seen.put(nums[i], i);\n        }\n        return new int[] {};\n    }\n}\n'
};

export default function CodeEditor({ value, onChange, language, onLanguageChange }: CodeEditorProps) {
  const [copied, setCopied] = useState(false);
  const [editorTheme, setEditorTheme] = useState("vs-dark");

  useEffect(() => {
    // Detect dark mode from root element
    const isDark = document.documentElement.classList.contains("dark");
    setEditorTheme(isDark ? "vs-dark" : "light");

    // MutationObserver to listen to class changes on documentElement
    const observer = new MutationObserver(() => {
      const darkActive = document.documentElement.classList.contains("dark");
      setEditorTheme(darkActive ? "vs-dark" : "light");
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    return () => observer.disconnect();
  }, []);

  const handleLanguageSelect = (lang: string) => {
    onLanguageChange(lang);
    if (!value || Object.values(TEMPLATES).includes(value)) {
      onChange(TEMPLATES[lang] || "");
    }
  };

  const handleReset = () => {
    if (confirm("Reset current editor contents to template?")) {
      onChange(TEMPLATES[language] || "");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-panel w-full bg-white/80 dark:bg-zinc-900/60 backdrop-blur-lg border border-slate-200/50 dark:border-zinc-800/50 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[480px]">
      
      {/* Editor Title Bar */}
      <div className="flex justify-between items-center px-4 py-3 border-b border-slate-100 dark:border-zinc-800/60 bg-slate-50/50 dark:bg-zinc-950/20">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-6 h-6 rounded-md bg-violet-500/10 text-violet-600 dark:text-violet-400">
            <Code2 size={13} />
          </div>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-250 font-display">Code Playground</span>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Language Selector */}
          <select 
            value={language}
            onChange={(e) => handleLanguageSelect(e.target.value)}
            className="text-[11px] font-bold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 border border-slate-200/40 dark:border-zinc-800/40 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-violet-500/50 cursor-pointer"
          >
            {LANGUAGES.map((l) => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200/60 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-500 dark:text-slate-400 hover:text-slate-750 dark:hover:text-white transition-all"
            title="Copy Solution"
          >
            {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
          </button>

          {/* Reset Button */}
          <button
            onClick={handleReset}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200/60 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-500 dark:text-slate-400 hover:text-slate-750 dark:hover:text-white transition-all"
            title="Reset to Template"
          >
            <RefreshCw size={12} />
          </button>
        </div>
      </div>

      {/* Monaco Editor Container */}
      <div className="flex-grow w-full relative">
        <Editor
          height="100%"
          language={language === "cpp" ? "cpp" : language}
          value={value}
          onChange={(val) => onChange(val || "")}
          theme={editorTheme}
          options={{
            fontSize: 12.5,
            fontFamily: "Fira Code, Source Code Pro, Consolas, Courier New, monospace",
            minimap: { enabled: false },
            lineNumbers: "on",
            scrollbar: {
              vertical: "visible",
              horizontal: "visible",
              useShadows: false,
              verticalScrollbarSize: 8,
              horizontalScrollbarSize: 8
            },
            padding: { top: 12, bottom: 12 },
            automaticLayout: true,
            tabSize: 4,
            cursorBlinking: "smooth"
          }}
        />
      </div>

      {/* Mock Footer Status */}
      <div className="flex justify-between items-center px-4 py-2 bg-slate-50/50 dark:bg-zinc-950/20 border-t border-slate-100 dark:border-zinc-800/60 text-[10px] text-slate-400 dark:text-slate-500 font-semibold font-outfit uppercase">
        <span>Cwd: ~/mock-workspace/interview</span>
        <span>Col 1, Ln 1 &bull; UTF-8</span>
      </div>
      
    </div>
  );
}
