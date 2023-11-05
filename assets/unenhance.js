enhanced = false
window.removeEventListener('scroll', handleScroll, { passive: true });
window.removeEventListener('resize', handleResize);
Array.from(items).forEach(x => x.width = "")