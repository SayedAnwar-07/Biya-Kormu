import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import {
  FileText,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  BarChart3,
  Eye,
  Calendar,
  Building,
  User as UserIcon,
  FileBarChart,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { fetchUserReports } from "@/redux/slices/reportSlice";
import { Helmet } from "react-helmet-async";

const GetReportMessages = () => {
  const { slug } = useParams();
  const { user } = useSelector((state) => state.user);

  const { eventReports: userReports, loading } = useSelector(
    (state) => state.reports,
  );
  const dispatch = useDispatch();
  const [expandedReports, setExpandedReports] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (slug) {
      dispatch(fetchUserReports(slug))
        .unwrap()
        .then((data) => {
          console.log("Fetched reports:", data);
        })
        .catch((err) => {
          console.error("Error fetching user reports:", err);
        });
    }
  }, [dispatch, slug]);

  const toggleReportExpansion = (reportId) => {
    setExpandedReports((prev) => ({
      ...prev,
      [reportId]: !prev[reportId],
    }));
  };

  const filteredReports = userReports.filter((report) => {
    const matchesSearch =
      report.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.brand_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.user_full_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      statusFilter === "all" || report.status === statusFilter;

    return matchesSearch && matchesFilter;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-amber-500" />;
      case "under_review":
        return <HelpCircle className="h-4 w-4 text-blue-500" />;
      case "resolved":
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-rose-500" />;
      case "needs_more_info":
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-amber-500/10 text-amber-700 border-amber-200";
      case "under_review":
        return "bg-blue-500/10 text-blue-700 border-blue-200";
      case "resolved":
        return "bg-emerald-500/10 text-emerald-700 border-emerald-200";
      case "rejected":
        return "bg-rose-500/10 text-rose-700 border-rose-200";
      case "needs_more_info":
        return "bg-orange-500/10 text-orange-700 border-orange-200";
      default:
        return "bg-gray-500/10 text-gray-700 border-gray-200";
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          <div className="text-center">
            <h3 className="text-lg font-medium">Loading Reports</h3>
            <p className="text-muted-foreground">
              Please wait while we fetch the reports.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!userReports.length) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4 max-w-md text-center">
          <div className="rounded-full bg-muted p-4">
            <FileBarChart className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-xl font-semibold">No Reports Found</h3>
            <p className="text-muted-foreground mt-1">
              No reports have been submitted by this user yet.
            </p>
          </div>
          <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4 mt-2">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-10">
      <Helmet>
        <title>{`${user.full_name} Reports - Biya Kormu`}</title>
      </Helmet>

      <div className="container mx-auto p-4 max-w-6xl">
        <div className="mb-8 pt-6">
          <h1 className="text-3xl font-bold tracking-tight">User Reports</h1>
          <p className="text-muted-foreground mt-2">
            View all reports submitted by this user
          </p>
        </div>

        {/* Filters and Search */}
        <div className="rounded-lg border bg-card p-6 mb-6 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <input
                type="text"
                placeholder="Search reports..."
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="under_review">Under Review</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
                <option value="needs_more_info">Needs More Info</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {[
            {
              label: "Total Reports",
              value: userReports.length,
              color: "bg-gray-50",
              icon: <FileText className="h-4 w-4 text-gray-500" />,
            },
            {
              label: "Pending",
              value: userReports.filter((r) => r.status === "pending").length,
              color: "bg-amber-50",
              icon: <Clock className="h-4 w-4 text-amber-500" />,
            },
            {
              label: "In Review",
              value: userReports.filter((r) => r.status === "under_review")
                .length,
              color: "bg-blue-50",
              icon: <HelpCircle className="h-4 w-4 text-blue-500" />,
            },
            {
              label: "Resolved",
              value: userReports.filter((r) => r.status === "resolved").length,
              color: "bg-emerald-50",
              icon: <CheckCircle className="h-4 w-4 text-emerald-500" />,
            },
            {
              label: "Rejected",
              value: userReports.filter((r) => r.status === "rejected").length,
              color: "bg-rose-50",
              icon: <XCircle className="h-4 w-4 text-rose-500" />,
            },
          ].map((stat, index) => (
            <div
              key={index}
              className="rounded-lg border bg-card p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3">
                <div className={`rounded-full p-2 ${stat.color} bg-opacity-10`}>
                  {stat.icon}
                </div>
                <div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Reports List */}
        <div className="space-y-4">
          {filteredReports.length > 0 ? (
            filteredReports.map((report) => (
              <div
                key={report.id}
                className="rounded-lg border bg-card overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Report Header */}
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            report.status,
                          )}`}
                        >
                          {getStatusIcon(report.status)}
                          <span className="ml-1 capitalize">
                            {report.status.replace("_", " ")}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(report.created_at), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      <h2 className="text-xl font-semibold">
                        Reported (
                        <span className="text-primary">
                          {report.brand_name}
                        </span>
                        )
                      </h2>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Submitted on{" "}
                          {format(new Date(report.created_at), "PPPP")}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleReportExpansion(report.id)}
                      className="p-2 hover:bg-accent rounded-md transition-colors"
                    >
                      {expandedReports[report.id] ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {expandedReports[report.id] && (
                  <div className="px-6 pb-6 space-y-6">
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-muted-foreground" />
                        Report Details
                      </h3>

                      {/* Event Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="rounded-md border p-4">
                          <h4 className="font-medium mb-3 flex items-center gap-2">
                            <Building className="h-4 w-4 text-muted-foreground" />
                            Brand Information
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">
                                Brand:
                              </span>
                              <p className="font-medium">{report.brand_name}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">
                                Seller:
                              </span>
                              <p className="font-medium">
                                {report.seller_full_name}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Reporter Information */}
                        <div className="rounded-md border p-4">
                          <h4 className="font-medium mb-3 flex items-center gap-2">
                            <UserIcon className="h-4 w-4 text-muted-foreground" />
                            Reporter Information
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">
                                Full Name:
                              </span>
                              <p className="font-medium">
                                {report.user_full_name}
                              </p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">
                                Phone:
                              </span>
                              <p className="font-medium">
                                {report.phone_number}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <div className="rounded-md border p-4 mb-6">
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          Description
                        </h4>
                        <div className="text-sm">
                          <p className="text-foreground">
                            {report.description}
                          </p>
                        </div>
                      </div>

                      {/* Images */}
                      {report.images_list && report.images_list.length > 0 && (
                        <div className="rounded-md border p-4 mb-6">
                          <h4 className="font-medium mb-3 flex items-center gap-2">
                            <ImageIcon className="h-4 w-4 text-muted-foreground" />
                            Evidence Images ({report.images_list.length})
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {report.images_list.map((image) => (
                              <div
                                key={image.id}
                                className="rounded-md overflow-hidden border hover:shadow-md transition-shadow"
                              >
                                <div className="relative group">
                                  <img
                                    src={image.image}
                                    alt={`Evidence ${image.id}`}
                                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                                  />
                                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center">
                                    <Eye className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                  </div>
                                </div>
                                <div className="p-3 bg-muted/30">
                                  <p className="text-xs text-muted-foreground">
                                    Uploaded:{" "}
                                    {format(new Date(image.uploaded_at), "PPp")}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Status Timeline */}
                      <div className="rounded-md border p-4">
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          Status History
                        </h4>
                        <div className="space-y-4 text-sm relative ml-3 pl-4 border-l-2 border-muted">
                          <div className="flex items-center gap-3 relative">
                            <div className="absolute -left-[18px] w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-background shadow"></div>
                            <span className="text-foreground">
                              Created on{" "}
                              {format(new Date(report.created_at), "PPp")}
                            </span>
                          </div>
                          {report.status_changed_at && (
                            <div className="flex items-center gap-3 relative pt-2">
                              <div className="absolute -left-[18px] w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-background shadow"></div>
                              <span className="text-foreground">
                                Status changed to{" "}
                                <span className="font-medium capitalize">
                                  {report.status.replace("_", " ")}
                                </span>{" "}
                                on{" "}
                                {format(
                                  new Date(report.status_changed_at),
                                  "PPp",
                                )}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="rounded-lg border bg-card p-8 text-center">
              <div className="rounded-full bg-muted p-3 inline-flex mb-4">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                No reports match your search
              </h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GetReportMessages;
