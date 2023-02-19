import { useEffect, useRef, useState } from 'react';
import { categories } from 'utils/settings';

export function useSettingCategory() {
  const listRef = useRef<HTMLDivElement>(null);
  const [currentCategory, setCurrentCategory] = useState(categories[0]);

  const scrollToCategory = (category: string) => {
    listRef.current
      ?.querySelector(`#${category.replaceAll(' ', '-')}`)
      ?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const { isIntersecting, target } of entries) {
          if (isIntersecting) {
            setCurrentCategory(target.id.replaceAll('-', ' '));
            break;
          }
        }
      },
      { root: listRef.current, rootMargin: '-10% 0px -90%' }
    );
    if (listRef.current) {
      Array.from(listRef.current.children).forEach((child) => observer.observe(child));
    }
    return () => observer.disconnect();
  }, []);

  return { listRef, currentCategory, scrollToCategory };
}
