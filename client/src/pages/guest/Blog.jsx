import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Calendar,
  ArrowRight,
  BookOpen,
  Newspaper,
  Activity,
  FlaskConical,
  HelpCircle,
} from "lucide-react";
import Input from "../../components/ui/Input";
import Badge from "../../components/ui/Badge";
import { api } from "../../utils/apiService";

const CATEGORIES = ["All", "Stories", "News", "Tips & Health", "Research", "FAQ"];

const CATEGORY_ICONS = {
  Stories: BookOpen,
  News: Newspaper,
  "Tips & Health": Activity,
  Research: FlaskConical,
  FAQ: HelpCircle,
};

const CATEGORY_TONES = {
  Stories: "purple",
  News: "blue",
  "Tips & Health": "green",
  Research: "orange",
  FAQ: "gray",
};

const POSTS = [
  {
    id: 1,
    title: "How One Rickshaw Puller in Dhaka Saved Three Lives in a Year",
    excerpt:
      "Md. Karim, a 34-year-old rickshaw puller from Mirpur, became an unlikely hero by donating blood every four months. His story is inspiring a whole neighbourhood.",
    author: "Ayesha Rahman",
    date: "Aug 2, 2026",
    readTime: "5 min read",
    category: "Stories",
  },
  {
    id: 2,
    title: "BloodConnect Partners with Dhaka Medical College for 24/7 Supply",
    excerpt:
      "A new partnership ensures that emergency patients at DMCH can access matched donors within minutes through our real-time donor network.",
    author: "Tanvir Ahmed",
    date: "Jul 28, 2026",
    readTime: "3 min read",
    category: "News",
  },
  {
    id: 3,
    title: "What to Eat Before and After Donating Blood: A Bangladeshi Guide",
    excerpt:
      "From iron-rich shak and daal to staying hydrated in Dhaka's heat, here is a practical nutrition guide for donors across Bangladesh.",
    author: "Dr. Nusrat Jahan",
    date: "Jul 20, 2026",
    readTime: "6 min read",
    category: "Tips & Health",
  },
  {
    id: 4,
    title: "Thalassemia in Bangladesh: Why Regular Donors Matter So Much",
    excerpt:
      "With thousands of children needing monthly transfusions, we look at the research behind Bangladesh's growing demand for safe, regular blood donors.",
    author: "Dr. Farhana Kabir",
    date: "Jul 15, 2026",
    readTime: "8 min read",
    category: "Research",
  },
  {
    id: 5,
    title: "Am I Eligible to Donate? Answers to the Most Common Questions",
    excerpt:
      "Age, weight, recent illness, and the four-month gap rule explained simply for first-time donors in Bangladesh.",
    author: "Rafiqul Islam",
    date: "Jul 10, 2026",
    readTime: "4 min read",
    category: "FAQ",
  },
  {
    id: 6,
    title: "Flood Relief in Sylhet: How Volunteers Kept Blood Flowing",
    excerpt:
      "When roads were submerged, a network of student volunteers used boats and BloodConnect alerts to reach stranded patients in time.",
    author: "Ayesha Rahman",
    date: "Jul 5, 2026",
    readTime: "7 min read",
    category: "Stories",
  },
  {
    id: 7,
    title: "New Blood Screening Lab Opens in Chattogram",
    excerpt:
      "State-of-the-art screening equipment now reduces testing time and improves the safety of every unit collected in the port city.",
    author: "Tanvir Ahmed",
    date: "Jun 30, 2026",
    readTime: "3 min read",
    category: "News",
  },
  {
    id: 8,
    title: "Staying Safe: Managing Anaemia and Donation During Ramadan",
    excerpt:
      "Tips for donors who fast, including the best times to donate and how to keep your iron levels healthy through the month.",
    author: "Dr. Nusrat Jahan",
    date: "Jun 22, 2026",
    readTime: "5 min read",
    category: "Tips & Health",
  },
  {
    id: 9,
    title: "Mapping Rare Blood Groups Across Bangladesh's Divisions",
    excerpt:
      "Our data team analysed 50,000 donor records to understand where Bombay and Rh-negative donors are most and least available.",
    author: "Dr. Farhana Kabir",
    date: "Jun 14, 2026",
    readTime: "9 min read",
    category: "Research",
  },
];

function initials(name) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function Blog() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await api.get('/guest/blogs.php');
        if (res.success) {
          setPosts(res.blogs || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  const filtered = posts.filter((post) => {
    const matchesCategory =
      selectedCategory === "All" || post.category === selectedCategory;
    const matchesSearch = post.title
      .toLowerCase()
      .includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">
          BloodConnect Blog
        </h1>
        <p className="mt-2 text-gray-600 dark:text-slate-400">
          Stories, news, and health tips from Bangladesh's blood donation
          community.
        </p>
      </div>

      <div className="max-w-md mx-auto mb-8">
        <Input
          leftIcon={Search}
          placeholder="Search articles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-8 justify-center">
        {CATEGORIES.map((cat) => {
          const active = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={
                active
                  ? "bg-red-600 text-white rounded-md px-4 py-1.5 text-sm"
                  : "border border-gray-300 dark:border-slate-600 text-gray-600 dark:text-slate-300 rounded-md px-4 py-1.5 text-sm"
              }
            >
              {cat}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex justify-center mt-10">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
        </div>
      ) : (
        <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filtered.length > 0 ? (
            filtered.map((post) => {
              const Icon = CATEGORY_ICONS[post.category] || BookOpen;
              return (
                <Link
                  key={post.id}
                  to={`/blog/${post.slug || post.id}`}
                  className="group flex h-full flex-col overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm transition-all hover:shadow-[var(--shadow-card)] hover:-translate-y-1 dark:border-slate-700 dark:bg-slate-800"
                >
                  <div className="h-48 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/40 dark:to-slate-800 flex items-center justify-center">
                    <Icon className="size-12 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center justify-between">
                      <Badge
                        tone={CATEGORY_TONES[post.category] || "gray"}
                        size="sm"
                      >
                        {post.category}
                      </Badge>
                      <span className="text-xs text-gray-400 inline-flex items-center gap-1">
                        <Calendar className="size-3" />
                        {post.date}
                      </span>
                    </div>
                    <h2 className="font-semibold mt-2 line-clamp-2 text-gray-900 dark:text-slate-100">
                      {post.title}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-slate-400 mt-2 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="mt-auto pt-4 border-t border-gray-100 dark:border-slate-700 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="size-6 rounded-full bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-300 text-[10px] font-semibold flex items-center justify-center shrink-0">
                          {initials(post.author)}
                        </span>
                        <span className="text-xs text-gray-600 dark:text-slate-400">
                          {post.author} · {post.readTime}
                        </span>
                      </div>
                      <span className="text-red-600 text-sm inline-flex items-center gap-1 shrink-0">
                        Read More
                        <ArrowRight className="size-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })
          ) : (
            <p className="col-span-full text-center text-gray-500 dark:text-slate-400 py-12">
              No articles found. Try a different search or category.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
