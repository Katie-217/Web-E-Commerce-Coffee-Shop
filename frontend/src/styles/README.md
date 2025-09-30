# CSS Structure

Dự án đã được tổ chức lại với cấu trúc CSS modular để dễ quản lý và maintain.

## File Structure

```
src/styles/
├── style.css          # Main file - imports all other CSS files
├── reset.css          # Reset styles và CSS variables
├── navbar.css         # Navbar và navigation styles
├── hero.css           # Hero banner styles
├── sections.css       # Common section styles (about, menu, chefs, etc.)
├── responsive.css     # Media queries cho responsive design
├── menu.css           # Menu page specific styles
└── README.md          # This file
```

## File Descriptions

### `style.css`
- File chính import tất cả các file CSS khác
- Sử dụng `@import` để load các module

### `reset.css`
- Reset CSS cơ bản
- CSS variables (colors, fonts)
- Global styles cho body và html

### `navbar.css`
- Navbar styles
- Slider navigation
- Search box
- Notification bell
- User menu popup
- Logo styles

### `hero.css`
- Hero banner background
- Typed text animation
- Reserve button styles
- Overlay effects

### `sections.css`
- Common section layouts
- Section headers và titles
- About section
- Menu section
- Chefs section
- Gallery section
- Testimonials section
- Cards và grid layouts

### `responsive.css`
- Media queries cho tablet (768px)
- Media queries cho mobile (480px)
- Responsive adjustments cho menu page
- Touch-friendly optimizations

### `menu.css`
- Menu page specific styles
- Dark theme
- Glassmorphism effects
- Menu item animations
- Category navigation

## Benefits

1. **Modularity**: Mỗi component có CSS riêng
2. **Maintainability**: Dễ dàng tìm và sửa styles
3. **Performance**: Chỉ load CSS cần thiết
4. **Scalability**: Dễ dàng thêm component mới
5. **Team Work**: Nhiều developer có thể làm việc song song

## Usage

Để thêm styles mới:
1. Tạo file CSS mới trong `src/styles/`
2. Import trong `style.css`
3. Hoặc thêm vào file CSS phù hợp nếu liên quan

## Best Practices

- Sử dụng CSS variables cho colors và spacing
- Tổ chức styles theo component
- Responsive design cho tất cả components
- Consistent naming conventions
- Minimal CSS conflicts 