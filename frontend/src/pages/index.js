import Head from "next/head";
import {
  UserGroupIcon,
  SparklesIcon,
  RocketLaunchIcon,
  ShieldCheckIcon,
  StarIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import Button from "../components/Button";
import useUserStore from "../store/useUserStore";
import { useRouter } from "next/router";

export default function Home() {
  const { user } = useUserStore();
  const router = useRouter();
  const features = [
    {
      icon: UserGroupIcon,
      title: "Connect with Experts",
      description:
        "Find talented professionals in your field and build meaningful connections.",
      color: "from-blue-500 to-indigo-500",
    },
    {
      icon: SparklesIcon,
      title: "Skill Exchange",
      description:
        "Trade your expertise for new skills. Learn from others while teaching.",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: RocketLaunchIcon,
      title: "Accelerate Growth",
      description: "Fast-track your career by learning from industry experts.",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: ShieldCheckIcon,
      title: "Trusted Community",
      description: "Verified profiles and reviews ensure quality connections.",
      color: "from-orange-500 to-red-500",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "UX Designer",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      content:
        "SkillSwap helped me learn advanced prototyping while teaching others about design systems.",
      rating: 5,
    },
    {
      name: "Marcus Rodriguez",
      role: "Full Stack Developer",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      content:
        "I traded my React skills for Python expertise. The community is incredibly supportive.",
      rating: 5,
    },
    {
      name: "Emma Thompson",
      role: "Product Manager",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      content:
        "Found my mentor through SkillSwap. Now I'm leading product strategy at a startup.",
      rating: 5,
    },
  ];

  return (
    <>
      <Head>
        <title>SkillSwap</title>
      </Head>

      {/* Hero Section */}
      <section className="text-center space-y-10">
        <div className="space-y-6">
          <h1 className="text-5xl md:text-6xl font-bold leading-tight">
            <span className="bg-gradient-to-r from-[#1c398e] via-indigo-600 to-[#1c398e] bg-clip-text text-transparent">
              Swap Skills,
            </span>
            <br />
            <span className="text-gray-800">Build Connections</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Connect with talented professionals, exchange expertise, and
            accelerate your growth. Join thousands of learners and teachers on
            the most innovative skill-sharing platform.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {!user ? (
            <>
              <Button
                size="xl"
                className="w-full sm:w-auto font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-md"
                as="a"
                onClick={() => router.push("/auth/register")}
              >
                Get Started
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="xl"
                className="w-full sm:w-auto font-semibold border-blue-600 text-blue-600 hover:bg-blue-50 shadow-sm"
                as="a"
                onClick={() => router.push("/auth/login")}
              >
                Sign In
              </Button>
            </>
          ) : (
            <>
              <Button
                size="xl"
                className="w-full sm:w-auto font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:from-blue-700 hover:to-indigo-700"
                as="a"
                onClick={() => router.push("/skills")}
              >
                Browse Skills
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="xl"
                className="w-full sm:w-auto font-semibold border-blue-600 text-blue-600 hover:bg-blue-50 shadow-sm"
                as="a"
                onClick={() => router.push("/swap")}
              >
                Create Swap
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center justify-center space-x-6 text-sm text-slate-500 mt-4">
          <div className="flex items-center">
            <StarIcon className="w-5 h-5 text-yellow-400 mr-1" />
            <span>4.9/5 from 2,000+ reviews</span>
          </div>
          <div>•</div>
          <div>10,000+ skills exchanged</div>
          <div>•</div>
          <div>50,000+ members</div>
        </div>
      </section>

      {/* Features Section */}
      <section className="space-y-12 mt-24">
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
            Why Choose SkillSwap?
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Our platform makes skill exchange seamless, trustworthy, and
            rewarding.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 text-center rounded-2xl shadow-sm bg-white hover:shadow-md transition-transform transform hover:-translate-y-1"
            >
              <div
                className={`inline-flex p-3 rounded-2xl bg-gradient-to-r ${feature.color}`}
              >
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mt-4">
                {feature.title}
              </h3>
              <p className="text-slate-600 mt-2">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="space-y-12 mt-24">
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
            What Our Members Say
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Join thousands of satisfied members who’ve transformed their careers
            through SkillSwap.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="p-6 rounded-2xl shadow-md bg-white hover:shadow-lg transition-transform transform hover:-translate-y-1 space-y-4"
            >
              <div className="flex items-center space-x-4">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-semibold text-slate-900">
                    {testimonial.name}
                  </h4>
                  <p className="text-sm text-slate-500">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-slate-600">"{testimonial.content}"</p>
              <div className="flex items-center">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <StarIcon
                    key={i}
                    className="w-5 h-5 text-yellow-400 fill-current"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="text-center mt-24">
        <div className="bg-gradient-to-br from-slate-100 via-white to-slate-50 rounded-3xl shadow-xl px-8 py-12 space-y-8 max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
            {user ? "Start Your Next Swap" : "Ready to Start Your Journey?"}
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            {user
              ? "Find the perfect skill match or share your expertise today."
              : "Join SkillSwap and unlock opportunities to learn, teach, and grow."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="w-full sm:w-auto bg-black text-white hover:bg-gray-900 transition"
              as="a"
              onClick={() => router.push(user ? "/swap" : "/auth/register")}
            >
              {user ? "Create a Swap" : "Create Your Profile"}
              <ArrowRightIcon className="w-5 h-5 ml-2" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto border-gray-800 text-gray-800 hover:bg-gray-100 transition"
              as="a"
              onClick={() => router.push(user ? "skills" : "/about")}
            >
              {user ? "Browse Skills" : "Learn More"}
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
