import { Link, useParams } from "react-router-dom";
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
  const title = "Why O-negative Blood is the Universal Lifeline";

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
          {title}
        </span>
      </nav>

      <div className="h-72 w-full rounded-md bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/40 dark:to-slate-800 flex items-center justify-center mb-6">
        <Droplet className="size-20 text-red-600 dark:text-red-400" />
      </div>

      <div className="flex items-center gap-4 flex-wrap text-sm text-gray-500 dark:text-slate-400 mb-4">
        <Badge tone="red" size="sm">
          Research
        </Badge>
        <span className="inline-flex items-center gap-1">
          <Calendar className="size-4" />
          Jul 15, 2026
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock className="size-4" />8 min read
        </span>
        {id ? (
          <span className="text-xs text-gray-400">Article #{id}</span>
        ) : null}
      </div>

      <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-6">
        {title}
      </h1>

      <div className="flex items-center gap-3 mb-8 pb-8 border-b border-gray-200 dark:border-slate-700">
        <span className="size-10 rounded-full bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-300 text-sm font-semibold flex items-center justify-center shrink-0">
          FK
        </span>
        <div>
          <p className="font-medium text-gray-900 dark:text-slate-100">
            Dr. Farhana Kabir
          </p>
          <p className="text-xs text-gray-500 dark:text-slate-400">
            Hematologist · Jul 15, 2026
          </p>
        </div>
      </div>

      <article className="space-y-4 text-gray-700 dark:text-slate-300 leading-relaxed">
        <p>
          In emergency rooms across Bangladesh, from Dhaka Medical College to
          rural upazila health complexes, one blood group is requested more
          urgently than any other during a crisis: O-negative. Because it can be
          safely transfused to patients of almost any blood type, O-negative is
          the group doctors reach for when there is no time to cross-match.
        </p>
        <p>
          Yet O-negative donors make up only a small fraction of the population.
          When a road accident victim arrives unconscious on the Dhaka-Chattogram
          highway, or a mother suffers heavy bleeding during childbirth, that
          precious universal supply is often the difference between life and
          death.
        </p>

        <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100 mt-8">
          Why "Universal Donor" Really Matters in a Crisis
        </h2>
        <p>
          O-negative red cells carry neither A, B, nor Rh antigens, so a
          recipient's immune system will not attack them. In a trauma bay where
          seconds count, transfusion teams cannot always wait for lab results.
          Keeping a ready reserve of O-negative units allows hospitals to begin
          resuscitation immediately, then switch to matched blood once testing is
          complete.
        </p>

        <blockquote className="border-l-4 border-red-600 pl-4 italic text-gray-600 dark:text-slate-400">
          "A single O-negative donor in Dhaka can stabilise a patient long enough
          for us to find a perfect match. That is why we treat every O-negative
          donation as a strategic reserve for the whole city."
        </blockquote>

        <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100 mt-8">
          How You Can Help Bridge the Gap
        </h2>
        <p>
          If you are O-negative, you hold a rare and vital resource. Donating
          every four months, staying registered on BloodConnect, and keeping your
          contact details current means emergency teams can reach you the moment a
          patient needs universal blood. Eating iron-rich foods like daal, liver,
          and leafy shak between donations helps keep you eligible.
        </p>
        <p>
          Even if you are not O-negative, encouraging friends and family to learn
          their blood group and register as donors strengthens the entire
          network. Every registered donor shortens the search when a life hangs in
          the balance.
        </p>
      </article>

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
