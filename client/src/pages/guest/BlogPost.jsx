import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  Droplet,
  Calendar,
  Clock,
  Globe,
  MessageCircle,
  Share2,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import Badge from "../../components/ui/Badge";
import { api } from "../../utils/apiService";

const RELATED = [
  {
    id: 3,
    title: "What to Eat Before and After Donating Blood: A Bangladeshi Guide",
    readTime: "6 min read",
  },
  {
    id: 4,
    title: "Thalassemia in Bangladesh: Why Regular Donors Matter So Much",
    readTime: "8 min read",
  },
  {
    id: 9,
    title: "Mapping Rare Blood Groups Across Bangladesh's Divisions",
    readTime: "9 min read",
  },
];

export default function BlogPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await api.get('/guest/blog.php?slug=' + id);
        if (res.success && res.blog) {
          setPost(res.blog);
        } else {
          // not found
          navigate('/blog', { replace: true });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <nav className="text-sm text-gray-500 dark:text-slate-400 flex items-center gap-2 flex-wrap mb-6">
        <Link to="/" className="hover:text-red-600">
          Home
        </Link>
        <span>/</span>
        <Link to="/blog" className="hover:text-red-600">
          Blog
        </Link>
        <span>/</span>
        <span className="text-gray-700 dark:text-slate-300 line-clamp-1">
          {post.title}
        </span>
      </nav>

      <div className="h-72 w-full rounded-md bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/40 dark:to-slate-800 flex items-center justify-center mb-6">
        <Droplet className="size-20 text-red-600 dark:text-red-400" />
      </div>

      <div className="flex items-center gap-4 flex-wrap text-sm text-gray-500 dark:text-slate-400 mb-4">
        <Badge tone="red" size="sm">
          {post.tag}
        </Badge>
        <span className="inline-flex items-center gap-1">
          <Calendar className="size-4" />
          {post.date}
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock className="size-4" />
          {post.readTime}
        </span>
      </div>

      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-slate-100 mb-6 leading-tight">
        {post.title}
      </h1>

      <div className="flex items-center gap-3 border-y border-gray-100 dark:border-slate-700 py-4 mb-8">
        <div className="size-10 rounded-full bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-300 font-bold flex items-center justify-center">
          {post.author ? post.author.substring(0, 2).toUpperCase() : 'B'}
        </div>
        <div>
          <p className="font-semibold text-gray-900 dark:text-slate-100">
            {post.author}
          </p>
          <p className="text-xs text-gray-500 dark:text-slate-400">
            Medical Researcher
          </p>
        </div>
      </div>

      <div className="prose prose-red dark:prose-invert max-w-none mb-12 text-gray-700 dark:text-slate-300">
        <p className="lead text-xl text-gray-600 dark:text-slate-400 mb-6">
          {post.excerpt}
        </p>
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
      </div>

      <div className="mt-10 pt-6 border-t border-gray-200 dark:border-slate-700">
        <p className="font-medium text-gray-900 dark:text-slate-100 mb-3">
          Share this article
        </p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Share on the web"
            className="rounded-md border border-gray-300 dark:border-slate-600 p-2 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800"
          >
            <Globe className="size-5" />
          </button>
          <button
            type="button"
            aria-label="Share via message"
            className="rounded-md border border-gray-300 dark:border-slate-600 p-2 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800"
          >
            <MessageCircle className="size-5" />
          </button>
          <button
            type="button"
            aria-label="Copy share link"
            className="rounded-md border border-gray-300 dark:border-slate-600 p-2 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800"
          >
            <Share2 className="size-5" />
          </button>
        </div>
      </div>

      <div className="mt-12">
        <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-6">
          Related Articles
        </h3>
        <div className="grid sm:grid-cols-3 gap-6">
          {RELATED.map((post) => (
            <Link
              key={post.id}
              to={`/blog/${post.id}`}
              className="flex flex-col border border-gray-200 dark:border-slate-700 rounded-md overflow-hidden bg-white dark:bg-slate-800"
            >
              <div className="h-32 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/40 dark:to-slate-800 flex items-center justify-center">
                <BookOpen className="size-8 text-red-600 dark:text-red-400" />
              </div>
              <div className="p-4">
                <h4 className="font-semibold text-sm text-gray-900 dark:text-slate-100 line-clamp-2">
                  {post.title}
                </h4>
                <span className="mt-3 text-red-600 text-sm inline-flex items-center gap-1">
                  Read More
                  <ArrowRight className="size-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
