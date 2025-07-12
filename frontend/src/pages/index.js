import Head from "next/head";
import {
  UserGroupIcon,
  SparklesIcon,
  RocketLaunchIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  AcademicCapIcon,
  GlobeAltIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
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
      description:
        "Verified profiles and secure exchanges ensure quality connections.",
      color: "from-orange-500 to-red-500",
    },
  ];

  const howItWorks = [
    {
      step: "1",
      title: "Create Your Profile",
      description:
        "Showcase your skills and what you want to learn. Build a profile that highlights your expertise and learning goals.",
      icon: AcademicCapIcon,
    },
    {
      step: "2",
      title: "Find Your Match",
      description:
        "Browse through available skills or create a swap request. Connect with people who have what you need and need what you have.",
      icon: GlobeAltIcon,
    },
    {
      step: "3",
      title: "Exchange Skills",
      description:
        "Agree on terms, complete your tasks, and help each other grow. Our platform ensures fair and secure exchanges.",
      icon: ChatBubbleLeftRightIcon,
    },
    {
      step: "4",
      title: "Build Your Network",
      description:
        "Gain new skills, expand your professional network, and create lasting connections that benefit your career.",
      icon: UserGroupIcon,
    },
  ];

  const benefits = [
    "Learn new skills without paying for expensive courses",
    "Share your expertise and help others grow",
    "Build a professional network of like-minded individuals",
    "Gain practical experience through real projects",
    "Access diverse perspectives and knowledge",
    "Accelerate your career development",
    "Create meaningful connections in your industry",
    "Develop teaching and communication skills",
  ];

  return (
    <>
      <Head>
        <title>Swapr - Skill Exchange Platform</title>
      </Head>

      {/* Hero Section */}
      <section className="text-center space-y-10">
        <div className="space-y-6">
          <h1 className="text-5xl md:text-6xl font-bold leading-tight">
            <span className="bg-gradient-to-r from-[#1c398e] via-indigo-600 to-[#1c398e] bg-clip-text text-transparent">
              Swap Your Skills,
            </span>
            <br />
            <span className="text-gray-800">Exchange Knowledge</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Connect with talented professionals, exchange expertise, and
            accelerate your growth. Join a community of learners and teachers on
            our innovative skill-sharing platform.
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
      </section>

      {/* Features Section */}
      <section className="space-y-12 mt-24">
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
            Why Choose Swapr?
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Our platform makes skill exchange seamless, trustworthy, and
            rewarding for everyone involved.
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

      {/* How It Works Section */}
      <section className="space-y-12 mt-24">
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
            How It Works
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Get started in four simple steps and begin your skill exchange
            journey.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {howItWorks.map((step, index) => (
            <div
              key={index}
              className="relative p-6 rounded-2xl bg-white shadow-sm hover:shadow-md transition-all"
            >
              <div className="mt-4 text-center">
                <step.icon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="space-y-12 mt-24">
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
            Benefits of Skill Exchange
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Discover why skill exchange is the future of learning and
            professional development.
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 md:p-12">
          <div className="grid md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start space-x-3">
                <CheckCircleIcon className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-slate-700 font-medium">{benefit}</p>
              </div>
            ))}
          </div>
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
              : "Join Swapr and unlock opportunities to learn, teach, and grow."}
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
              onClick={() => router.push(user ? "skills" : "/auth/login")}
            >
              {user ? "Browse Skills" : "Sign In"}
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
