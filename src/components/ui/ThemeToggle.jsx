import { useState, useEffect } from "react"
import { Moon, Sun } from "lucide-react"

export function ThemeToggle() {
    const [isDark, setIsDark] = useState(true)

    useEffect(() => {
        const saved = localStorage.getItem('devflow_theme')
        if (saved === 'light') setIsDark(false)
    }, [])

    const toggle = () => {
        const next = !isDark
        setIsDark(next)
        localStorage.setItem('devflow_theme', next ? 'dark' : 'light')
        document.documentElement.classList.toggle('light-mode', !next)
    }

    return (
        <div
            className={`flex w-16 h-8 p-1 rounded-full cursor-pointer transition-all duration-300 ${isDark ? 'bg-[#111] border border-[#1A1A1A]' : 'bg-white border border-zinc-200'}`}
            onClick={toggle}
        >
            <div className="flex justify-between items-center w-full">
                <div className={`flex justify-center items-center w-6 h-6 rounded-full transition-transform duration-300 ${isDark ? 'translate-x-0 bg-[#1A1A1A]' : 'translate-x-8 bg-gray-200'}`}>
                    {isDark ? <Moon className="w-4 h-4 text-[#6EE7B7]" strokeWidth={1.5} /> : <Sun className="w-4 h-4 text-gray-700" strokeWidth={1.5} />}
                </div>
                <div className={`flex justify-center items-center w-6 h-6 rounded-full transition-transform duration-300 ${isDark ? 'bg-transparent' : '-translate-x-8'}`}>
                    {isDark ? <Sun className="w-4 h-4 text-[#64748B]" strokeWidth={1.5} /> : <Moon className="w-4 h-4 text-black" strokeWidth={1.5} />}
                </div>
            </div>
        </div>
    )
}
