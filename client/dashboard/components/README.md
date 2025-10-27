# Reusable Dashboard Components

This directory contains reusable UI components that ensure design consistency across all admin dashboard pages.

## 📦 Components Overview

### 1. **StatsCards** - Statistics Display
Displays a grid of statistics cards with consistent styling.

```tsx
import { StatsCards, StatCard } from '@/dashboard/components';

const stats: StatCard[] = [
  { label: 'Total Articles', value: 42, color: 'purple' },
  { label: 'Published', value: 30, color: 'green' },
  { label: 'Draft', value: 12, color: 'yellow' },
];

<StatsCards stats={stats} />
```

**Available Colors:** `purple`, `blue`, `green`, `yellow`, `red`, `gray`, `orange`, `pink`

**Auto Grid:** Automatically adjusts grid columns based on number of cards (2-5 columns)

---

### 2. **SearchBar** - Search Input with Optional Button
Consistent search input with optional search button.

```tsx
import { SearchBar } from '@/dashboard/components';

<SearchBar
  label="Search Articles"
  placeholder="Search by title, author, or content..."
  value={searchQuery}
  onChange={setSearchQuery}
  onSearch={() => handleSearch()} // Optional
/>
```

---

### 3. **FilterSelect** - Dropdown Filter
Accessible dropdown filter with label.

```tsx
import { FilterSelect } from '@/dashboard/components';

<FilterSelect
  label="Status"
  id="statusFilter"
  value={statusFilter}
  onChange={setStatusFilter}
  options={[
    { value: 'all', label: 'All Status' },
    { value: 'published', label: 'Published' },
    { value: 'draft', label: 'Draft' },
  ]}
/>
```

---

### 4. **DataTable** - Consistent Table Layout
Table with golden header gradient and sortable columns.

```tsx
import { DataTable, Column } from '@/dashboard/components';

const columns: Column[] = [
  { header: 'Title', sortable: true, onSort: () => handleSort('title'), align: 'left' },
  { header: 'Author', align: 'left' },
  { header: 'Date', sortable: true, onSort: () => handleSort('date'), align: 'left' },
  { header: 'Status', align: 'center' },
  { header: 'Actions', align: 'center', width: 'w-48' },
];

<DataTable
  columns={columns}
  sortField={sortField}
  sortOrder={sortOrder}
  emptyMessage="No articles found"
>
  {articles.map((article) => (
    <tr key={article._id} className="hover:bg-gray-50">
      <td className="px-6 py-4">{article.title}</td>
      <td className="px-6 py-4">{article.author.name}</td>
      <td className="px-6 py-4">{formatDate(article.createdAt)}</td>
      <td className="px-6 py-4 text-center">
        <StatusBadge status={article.status} />
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center justify-center gap-3">
          {/* Action buttons */}
        </div>
      </td>
    </tr>
  ))}
</DataTable>
```

---

### 5. **TableActionButton** - Icon Buttons for Table Actions
Consistent icon buttons with hover effects.

```tsx
import { TableActionButton } from '@/dashboard/components';

<div className="flex items-center justify-center gap-3">
  <TableActionButton
    onClick={(e) => { e.stopPropagation(); navigate(`/admin/articles/${id}`); }}
    icon="view"
    title="View Details"
    color="blue"
  />
  <TableActionButton
    onClick={(e) => { e.stopPropagation(); navigate(`/admin/articles/edit/${id}`); }}
    icon="edit"
    title="Edit"
    color="green"
  />
  <TableActionButton
    onClick={(e) => { e.stopPropagation(); handleDelete(id); }}
    icon="delete"
    title="Delete"
    color="red"
  />
</div>
```

**Available Icons:** `view`, `edit`, `delete`, `star`, `check`, `up`, `down`

**Available Colors:** `blue`, `green`, `red`, `yellow`, `purple`, `gray`

---

### 6. **Pagination** - Smart Pagination
Pagination with smart page number display (shows ellipsis for large page counts).

```tsx
import { Pagination } from '@/dashboard/components';

<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  totalItems={totalItems}
  onPageChange={setCurrentPage}
/>
```

**Features:**
- Shows first, last, current, and adjacent pages
- Displays `...` for skipped pages
- Automatically hides if only 1 page
- Shows total items count
- Disables Previous/Next when at boundaries

---

### 7. **PageHeader** - Page Title with Actions
Consistent page header with optional back button and action button.

```tsx
import { PageHeader } from '@/dashboard/components';

<PageHeader
  title="News Management"
  subtitle="Manage all news articles and blog posts"
  action={{
    label: 'New Article',
    onClick: () => navigate('/admin/news/create'),
    icon: <span>+</span>,
  }}
/>
```

**With Back Button:**
```tsx
<PageHeader
  title="Edit Article"
  showBackButton
  backTo="/admin/news"
/>
```

---

### 8. **StatusBadge** - Status Indicators
Colored badges for status display.

```tsx
import { StatusBadge } from '@/dashboard/components';

<StatusBadge status="published" />
<StatusBadge status="draft" />
<StatusBadge status="active" />
```

**Supported Statuses:**
- **Article:** `published`, `draft`, `archived`
- **General:** `active`, `inactive`, `pending`
- **Messages:** `unread`, `read`, `resolved`
- **Priority:** `low`, `medium`, `high`, `urgent`

**Custom Color Map:**
```tsx
<StatusBadge
  status="custom"
  colorMap={{ custom: 'bg-pink-100 text-pink-800 border-pink-300' }}
/>
```

---

### 9. **LoadingSpinner** - Loading State
Animated loading spinner with message.

```tsx
import { LoadingSpinner } from '@/dashboard/components';

{loading && <LoadingSpinner message="Loading articles..." />}
```

---

## 🎨 Design Principles

### Colors
- **Royal Gold:** Primary accent (`#D4AF37` / `royal-gold`)
- **Royal Black:** Text headings (`#1a1a1a` / `royal-black`)
- **Status Colors:** Semantic colors (green=success, yellow=warning, red=danger, blue=info)

### Spacing
- Cards: `p-6`, `gap-6`
- Table cells: `px-6 py-4`
- Borders: `border-2`

### Typography
- Headers: `text-4xl font-bold`
- Labels: `text-sm font-semibold`
- Stats: `text-3xl font-bold`

### Borders & Shadows
- Cards: `border-2 border-gray-200 rounded-xl shadow-sm`
- Table header: `border-b-2 border-royal-gold`
- Hover: `hover:bg-gray-50` or `hover:border-royal-gold`

---

## 📝 Usage Example: Complete Page

```tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  StatsCards,
  SearchBar,
  FilterSelect,
  DataTable,
  TableActionButton,
  Pagination,
  PageHeader,
  StatusBadge,
  LoadingSpinner,
  type StatCard,
  type Column,
} from '@/dashboard/components';

export const AdminArticles = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const stats: StatCard[] = [
    { label: 'Total Articles', value: 42, color: 'purple' },
    { label: 'Published', value: 30, color: 'green' },
    { label: 'Draft', value: 12, color: 'yellow' },
  ];

  const columns: Column[] = [
    { header: 'Title', sortable: true, align: 'left' },
    { header: 'Status', align: 'center' },
    { header: 'Actions', align: 'center', width: 'w-48' },
  ];

  return (
    <div className="p-8">
      <PageHeader
        title="Articles Management"
        subtitle="Manage all articles and blog posts"
        action={{
          label: 'New Article',
          onClick: () => navigate('/admin/articles/create'),
          icon: <span>+</span>,
        }}
      />

      <StatsCards stats={stats} />

      <div className="mt-8 grid md:grid-cols-2 gap-6">
        <SearchBar
          label="Search Articles"
          placeholder="Search by title or content..."
          value={searchQuery}
          onChange={setSearchQuery}
        />
        <FilterSelect
          label="Status"
          id="statusFilter"
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: 'all', label: 'All Status' },
            { value: 'published', label: 'Published' },
            { value: 'draft', label: 'Draft' },
          ]}
        />
      </div>

      {loading ? (
        <LoadingSpinner message="Loading articles..." />
      ) : (
        <>
          <DataTable columns={columns} emptyMessage="No articles found">
            {articles.map((article) => (
              <tr key={article._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">{article.title}</td>
                <td className="px-6 py-4 text-center">
                  <StatusBadge status={article.status} />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-3">
                    <TableActionButton
                      onClick={() => navigate(`/admin/articles/${article._id}`)}
                      icon="view"
                      title="View"
                      color="blue"
                    />
                    <TableActionButton
                      onClick={() => navigate(`/admin/articles/edit/${article._id}`)}
                      icon="edit"
                      title="Edit"
                      color="green"
                    />
                    <TableActionButton
                      onClick={() => handleDelete(article._id)}
                      icon="delete"
                      title="Delete"
                      color="red"
                    />
                  </div>
                </td>
              </tr>
            ))}
          </DataTable>
          <Pagination
            currentPage={currentPage}
            totalPages={10}
            totalItems={100}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  );
};
```

---

## ✅ Consistency Checklist

When creating a new admin page, ensure:

- [ ] Use `PageHeader` for consistent titles
- [ ] Use `StatsCards` above filters
- [ ] Use `SearchBar` and `FilterSelect` in a grid
- [ ] Use `DataTable` with golden header
- [ ] Use `TableActionButton` for all table actions
- [ ] Use `Pagination` at the bottom
- [ ] Use `StatusBadge` for status columns
- [ ] Use `LoadingSpinner` during data fetch
- [ ] Follow consistent spacing (p-6, gap-6, px-6 py-4)
- [ ] Use royal-gold for primary actions
- [ ] Add `e.stopPropagation()` to action buttons

---

## 🚀 Next Steps

You're now ready to build the Users Management page with complete design consistency!


