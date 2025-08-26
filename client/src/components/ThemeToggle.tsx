import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
	const [isDark, setIsDark] = useState(false);
	useEffect(() => {
		const stored = localStorage.getItem('theme');
		const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
		const shouldDark = stored ? stored === 'dark' : prefersDark;
		document.documentElement.classList.toggle('dark', shouldDark);
		setIsDark(shouldDark);
	}, []);
	const toggle = () => {
		const next = !isDark;
		document.documentElement.classList.toggle('dark', next);
		localStorage.setItem('theme', next ? 'dark' : 'light');
		setIsDark(next);
	};
	return (
		<button onClick={toggle} className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-accent">
			{isDark ? <Sun size={16}/> : <Moon size={16}/>} {isDark ? 'Light' : 'Dark'}
		</button>
	);
}