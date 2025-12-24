"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Save,
  Download,
  BarChart3,
  Calendar,
  User,
  Users,
  BookOpen,
  CalendarDays,
  TrendingUp,
  TrendingDown,
  Wallet,
  Home,
  Edit,
  Eye,
  EyeOff,
} from "lucide-react";

const WOR_NAMES = [
  "45south",
  "45north",
  "46",
  "46 school",
  "47",
  "47 school",
  "madrasah",
];
const REPORT_TYPES = ["সাথী", "কর্মী", "সমর্থক", "বন্ধু"];
const ACTIVITIES = [
  { id: "উপশাখা_দায়িত্বশীল_বৈঠক", label: "উপশাখা দায়িত্বশীল বৈঠক" },
  { id: "সাথী_বৈঠক", label: "সাথী বৈঠক" },
  { id: "কর্মী_বৈঠক", label: "কর্মী বৈঠক" },
  { id: "কুরান_তালীম", label: "কুরআন তালীম" },
  { id: "সামষ্টিক_বৈঠক", label: "সামষ্টিক বৈঠক" },
  { id: "সাধারণ_সভা", label: "সাধারণ সভা" },
  { id: "আলোচনা_চক্র", label: "আলোচনা চক্র" },
];

export default function Page() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    worName: WOR_NAMES[0],
    month: new Date().toLocaleString("bn-BD", {
      month: "long",
      year: "numeric",
    }),
    date: new Date().toISOString().split("T")[0],

    // সদস্য প্রতিবেদন
    reports: REPORT_TYPES.reduce(
      (acc, type) => ({
        ...acc,
        [type]: {
          previous: "",
          current: "",
          increase: "",
          decrease: "",
        },
      }),
      {}
    ),

    // কার্যক্রম প্রতিবেদন
    activities: ACTIVITIES.reduce(
      (acc, activity) => ({
        ...acc,
        [activity.id]: {
          total: "",
          present: "",
        },
      }),
      {}
    ),

    // বায়তুলমাল
    baitulmal: {
      totalIncome: "",
      totalExpense: "",
    },
  });

  const [savedReports, setSavedReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState({});
  const [editMode, setEditMode] = useState(true);

  // Fetch existing reports
  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await fetch("/api/reports");
      const data = await response.json();
      setSavedReports(data);
    } catch (error) {
      console.error("Error fetching reports:", error);
    }
  };

  const handleInputChange = (section, field, value, subField = null) => {
    setFormData((prev) => {
      if (subField) {
        const newData = {
          ...prev,
          [section]: {
            ...prev[section],
            [field]: {
              ...prev[section][field],
              [subField]: value === "" ? "" : Number(value) || 0,
            },
          },
        };

        // Auto-calculate increase/decrease for reports
        if (
          section === "reports" &&
          (subField === "previous" || subField === "current")
        ) {
          const current =
            subField === "current"
              ? value === ""
                ? ""
                : Number(value) || 0
              : newData.reports[field].current;
          const previous =
            subField === "previous"
              ? value === ""
                ? ""
                : Number(value) || 0
              : newData.reports[field].previous;

          if (current !== "" && previous !== "") {
            const diff = Number(current) - Number(previous);
            newData.reports[field] = {
              ...newData.reports[field],
              increase: diff > 0 ? diff : "",
              decrease: diff < 0 ? Math.abs(diff) : "",
            };
          }
        }

        return newData;
      } else {
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [field]: value === "" ? "" : Number(value) || 0,
          },
        };
      }
    });
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      // Prepare data for API
      const reportData = {
        ...formData,
        reports: Object.keys(formData.reports).reduce(
          (acc, type) => ({
            ...acc,
            [type]: {
              previous:
                formData.reports[type].previous === ""
                  ? 0
                  : formData.reports[type].previous,
              current:
                formData.reports[type].current === ""
                  ? 0
                  : formData.reports[type].current,
              increase:
                formData.reports[type].increase === ""
                  ? 0
                  : formData.reports[type].increase,
              decrease:
                formData.reports[type].decrease === ""
                  ? 0
                  : formData.reports[type].decrease,
            },
          }),
          {}
        ),
        activities: Object.keys(formData.activities).reduce(
          (acc, activity) => ({
            ...acc,
            [activity]: {
              total:
                formData.activities[activity].total === ""
                  ? 0
                  : formData.activities[activity].total,
              present:
                formData.activities[activity].present === ""
                  ? 0
                  : formData.activities[activity].present,
            },
          }),
          {}
        ),
        baitulmal: {
          totalIncome:
            formData.baitulmal.totalIncome === ""
              ? 0
              : formData.baitulmal.totalIncome,
          totalExpense:
            formData.baitulmal.totalExpense === ""
              ? 0
              : formData.baitulmal.totalExpense,
        },
      };

      const response = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reportData),
      });

      if (response.ok) {
        alert("রিপোর্ট সফলভাবে সংরক্ষিত হয়েছে!");
        resetForm();
        fetchReports(); // Refresh the list
      } else {
        throw new Error("Failed to save report");
      }
    } catch (error) {
      console.error("Error saving report:", error);
      alert("রিপোর্ট সংরক্ষণ ব্যর্থ হয়েছে!");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      worName: WOR_NAMES[0],
      month: new Date().toLocaleString("bn-BD", {
        month: "long",
        year: "numeric",
      }),
      date: new Date().toISOString().split("T")[0],
      reports: REPORT_TYPES.reduce(
        (acc, type) => ({
          ...acc,
          [type]: {
            previous: "",
            current: "",
            increase: "",
            decrease: "",
          },
        }),
        {}
      ),
      activities: ACTIVITIES.reduce(
        (acc, activity) => ({
          ...acc,
          [activity.id]: {
            total: "",
            present: "",
          },
        }),
        {}
      ),
      baitulmal: {
        totalIncome: "",
        totalExpense: "",
      },
    });
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(savedReports, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = `reports_${
      new Date().toISOString().split("T")[0]
    }.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  const toggleEditMode = () => {
    setEditMode(!editMode);
  };

  const deleteReport = async (id) => {
    if (confirm("আপনি কি নিশ্চিত এই রিপোর্টটি মুছতে চান?")) {
      try {
        const response = await fetch(`/api/reports/${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          alert("রিপোর্ট মুছে ফেলা হয়েছে!");
          fetchReports();
        }
      } catch (error) {
        console.error("Error deleting report:", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  রিপোর্টিং সিস্টেম
                </h1>
                <p className="text-gray-700">জামায়াতের কার্যক্রম প্রতিবেদন</p>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => router.push("/dashboard")}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <BarChart3 className="h-5 w-5 mr-2" />
                ড্যাশবোর্ড
              </button>
              <button
                onClick={handleExport}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Download className="h-5 w-5 mr-2" />
                এক্সপোর্ট
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Basic Information */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Calendar className="h-6 w-6 text-blue-600 mr-2" />
              <h2 className="text-2xl font-bold text-gray-900">
                প্রাথমিক তথ্য
              </h2>
            </div>
            <button
              onClick={toggleEditMode}
              className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              {editMode ? (
                <EyeOff className="h-5 w-5 mr-2" />
              ) : (
                <Edit className="h-5 w-5 mr-2" />
              )}
              {editMode ? "সম্পাদনা বন্ধ করুন" : "সম্পাদনা করুন"}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                ওয়ার নাম
              </label>
              <select
                value={formData.worName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, worName: e.target.value }))
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              >
                {WOR_NAMES.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                মাস
              </label>
              <input
                type="text"
                value={formData.month}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, month: e.target.value }))
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                placeholder="e.g., ডিসেম্বর ২০২৪"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                তারিখ
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, date: e.target.value }))
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              />
            </div>
          </div>
        </div>

        {/* সদস্য প্রতিবেদন Section - Similar to কার্যক্রম প্রতিবেদন UI */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex items-center mb-6">
            <Users className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-2xl font-bold text-gray-900">
              সদস্য প্রতিবেদন
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {REPORT_TYPES.map((type) => (
              <div
                key={type}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
              >
                <h3 className="font-bold text-gray-900 mb-4 text-center">
                  {type}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-900 mb-1">
                      পূর্বের সংখ্যা
                    </label>
                    <input
                      type="number"
                      value={formData.reports[type].previous}
                      onChange={(e) =>
                        handleInputChange(
                          "reports",
                          type,
                          e.target.value,
                          "previous"
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-gray-900"
                      min="0"
                      disabled={!editMode}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-900 mb-1">
                      বর্তমান সংখ্যা
                    </label>
                    <input
                      type="number"
                      value={formData.reports[type].current}
                      onChange={(e) =>
                        handleInputChange(
                          "reports",
                          type,
                          e.target.value,
                          "current"
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-gray-900"
                      min="0"
                      disabled={!editMode}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm text-gray-900 mb-1">
                        বৃদ্ধি
                      </label>
                      <input
                        type="number"
                        value={formData.reports[type].increase}
                        onChange={(e) =>
                          handleInputChange(
                            "reports",
                            type,
                            e.target.value,
                            "increase"
                          )
                        }
                        className="w-full px-3 py-2 border border-green-200 rounded focus:ring-2 focus:ring-green-500 text-gray-900 bg-green-50"
                        min="0"
                        disabled={!editMode}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-900 mb-1">
                        ঘাটতি
                      </label>
                      <input
                        type="number"
                        value={formData.reports[type].decrease}
                        onChange={(e) =>
                          handleInputChange(
                            "reports",
                            type,
                            e.target.value,
                            "decrease"
                          )
                        }
                        className="w-full px-3 py-2 border border-red-200 rounded focus:ring-2 focus:ring-red-500 text-gray-900 bg-red-50"
                        min="0"
                        disabled={!editMode}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* কার্যক্রম প্রতিবেদন Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex items-center mb-6">
            <CalendarDays className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-2xl font-bold text-gray-900">
              কার্যক্রম প্রতিবেদন
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {ACTIVITIES.map((activity) => (
              <div
                key={activity.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
              >
                <h3 className="font-medium text-gray-900 mb-4 text-sm">
                  {activity.label}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-900 mb-1">
                      মোট সংখ্যা
                    </label>
                    <input
                      type="number"
                      value={formData.activities[activity.id].total}
                      onChange={(e) =>
                        handleInputChange(
                          "activities",
                          activity.id,
                          e.target.value,
                          "total"
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-gray-900"
                      min="0"
                      disabled={!editMode}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-900 mb-1">
                      উপস্থিত সংখ্যা
                    </label>
                    <input
                      type="number"
                      value={formData.activities[activity.id].present}
                      onChange={(e) =>
                        handleInputChange(
                          "activities",
                          activity.id,
                          e.target.value,
                          "present"
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-gray-900"
                      min="0"
                      disabled={!editMode}
                    />
                  </div>
                </div>
                {formData.activities[activity.id].total &&
                  formData.activities[activity.id].total > 0 && (
                    <div className="mt-3">
                      <div className="text-sm text-gray-900">
                        {formData.activities[activity.id].total > 0 ? (
                          <>
                            উপস্থিতি:{" "}
                            {(
                              (formData.activities[activity.id].present /
                                (formData.activities[activity.id].total * 3)) *
                              100
                            ).toFixed(1)}
                            %
                            <div className="text-xs text-gray-600 mt-1">
                              {formData.activities[activity.id].present} জন /{" "}
                              {formData.activities[activity.id].total * 3} জন হওয়ার কথা ছিল
                            </div>
                          </>
                        ) : (
                          <span className="text-gray-500">অনুপস্থিত</span>
                        )}
                      </div>
                      {formData.activities[activity.id].total > 0 && (
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${Math.min(
                                100,
                                (formData.activities[activity.id].present /
                                  (formData.activities[activity.id].total *
                                    3)) *
                                  100
                              )}%`,
                            }}
                          ></div>
                        </div>
                      )}
                    </div>
                  )}
              </div>
            ))}
          </div>
        </div>

        {/* বায়তুলমাল Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex items-center mb-6">
            <Wallet className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-2xl font-bold text-gray-900">বায়তুলমাল</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                মোট আয়
              </h3>
              <div className="flex items-center">
                <span className="text-3xl font-bold text-green-600 mr-2">
                  ৳
                </span>
                <input
                  type="number"
                  value={formData.baitulmal.totalIncome}
                  onChange={(e) =>
                    handleInputChange(
                      "baitulmal",
                      "totalIncome",
                      e.target.value
                    )
                  }
                  className="text-4xl font-bold text-green-700 bg-transparent border-none focus:outline-none w-full text-gray-900"
                  placeholder="0"
                  disabled={!editMode}
                />
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                মোট ব্যয়
              </h3>
              <div className="flex items-center">
                <span className="text-3xl font-bold text-red-600 mr-2">৳</span>
                <input
                  type="number"
                  value={formData.baitulmal.totalExpense}
                  onChange={(e) =>
                    handleInputChange(
                      "baitulmal",
                      "totalExpense",
                      e.target.value
                    )
                  }
                  className="text-4xl font-bold text-red-700 bg-transparent border-none focus:outline-none w-full text-gray-900"
                  placeholder="0"
                  disabled={!editMode}
                />
              </div>
            </div>
          </div>

          {formData.baitulmal.totalIncome &&
            formData.baitulmal.totalExpense &&
            formData.baitulmal.totalIncome > 0 &&
            formData.baitulmal.totalExpense > 0 && (
              <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-gray-900">নিট ব্যালেন্স:</span>
                    <span
                      className={`ml-2 text-2xl font-bold ${
                        formData.baitulmal.totalIncome -
                          formData.baitulmal.totalExpense >=
                        0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      ৳{" "}
                      {(
                        formData.baitulmal.totalIncome -
                        formData.baitulmal.totalExpense
                      ).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-gray-900">
                    {(
                      (formData.baitulmal.totalExpense /
                        formData.baitulmal.totalIncome) *
                      100
                    ).toFixed(1)}
                    % ব্যয়িত
                  </div>
                </div>
              </div>
            )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={resetForm}
            className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            disabled={loading}
          >
            রিসেট
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !editMode}
            className={`px-8 py-3 rounded-xl transition-colors font-medium flex items-center ${
              loading || !editMode
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            <Save className="h-5 w-5 mr-2" />
            {loading ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}
          </button>
        </div>

        {/* Saved Reports Preview */}
        {savedReports.length > 0 && (
          <div className="mt-12">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                সর্বশেষ রিপোর্টসমূহ
              </h3>
              <span className="text-gray-700">
                মোট: {savedReports.length} টি রিপোর্ট
              </span>
            </div>
            <div className="overflow-x-auto bg-white rounded-xl shadow">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                      ওয়ার নাম
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                      মাস
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                      তারিখ
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                      সাথী
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                      কর্মী
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                      আয়/ব্যয়
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                      কার্যক্রম
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {savedReports.slice(0, 5).map((report, index) => (
                    <tr key={report._id || index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {report.worName}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {report.month}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {new Date(report.date).toLocaleDateString("bn-BD")}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-900">
                          {report.reports.সাথী.current}
                        </span>
                        <span
                          className={`ml-2 text-sm ${
                            report.reports.সাথী.increase > 0
                              ? "text-green-600"
                              : report.reports.সাথী.decrease > 0
                              ? "text-red-600"
                              : "text-gray-500"
                          }`}
                        >
                          {report.reports.সাথী.increase > 0
                            ? `+${report.reports.সাথী.increase}`
                            : report.reports.সাথী.decrease > 0
                            ? `-${report.reports.সাথী.decrease}`
                            : ""}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-900">
                          {report.reports.কর্মী.current}
                        </span>
                        <span
                          className={`ml-2 text-sm ${
                            report.reports.কর্মী.increase > 0
                              ? "text-green-600"
                              : report.reports.কর্মী.decrease > 0
                              ? "text-red-600"
                              : "text-gray-500"
                          }`}
                        >
                          {report.reports.কর্মী.increase > 0
                            ? `+${report.reports.কর্মী.increase}`
                            : report.reports.কর্মী.decrease > 0
                            ? `-${report.reports.কর্মী.decrease}`
                            : ""}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="text-green-600">
                            আয়: ৳{report.baitulmal.totalIncome.toLocaleString()}
                          </div>
                          <div className="text-red-600">
                            ব্যয়: ৳
                            {report.baitulmal.totalExpense.toLocaleString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => deleteReport(report._id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          মুছুন
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {savedReports.length > 5 && (
              <div className="text-center mt-4">
                <button
                  onClick={() => router.push("/dashboard")}
                  className="text-blue-600 hover:text-blue-800"
                >
                  আরও দেখুন →
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
