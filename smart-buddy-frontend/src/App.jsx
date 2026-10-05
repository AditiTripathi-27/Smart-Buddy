import React, { useState, useEffect } from "react";
import "./App.css";

import {
  fetchDashboardStats,
  fetchRecentActivity,
  addTask as addTaskAPI
} from "./api/apiService";

const initialTasks = [
  {
    id: 1,
    title: "Complete DBMS assignment",
    due: "12 Sep 2026",
    status: "Pending",
  },
  {
    id: 2,
    title: "Define CN exp 6 in lab file",
    due: "16 Sep 2026",
    status: "Pending",
  },
  {
    id: 3,
    title: "Submit ED experiment 2 report",
    due: "20 Sep 2026",
    status: "Pending",
  },
  {
    id: 4,
    title: "Collect texts for tutorial 4",
    due: "25 Sep 2026",
    status: "Completed",
  },
];

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [profileName, setProfileName] = useState("Aditi");
  const [profileBranch, setProfileBranch] = useState("Information Technology");
  const [profileDivision, setProfileDivision] = useState("A");

  const [draftProfileName, setDraftProfileName] = useState("Aditi");
  const [draftProfileBranch, setDraftProfileBranch] = useState(
    "Information Technology"
  );
  const [draftProfileDivision, setDraftProfileDivision] = useState("A");

  const [profileSaved, setProfileSaved] = useState(false);
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [role, setRole] = useState("Student");
  const [showRegister, setShowRegister] = useState(false);

  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerBranch, setRegisterBranch] = useState("Information Technology");
  const [registerError, setRegisterError] = useState("");
  const [registerSuccess, setRegisterSuccess] = useState("");

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success"
  });

  const showToast = (message, type = "success") => {
    setToast({
      show: true,
      message,
      type
    });

    setTimeout(() => {
      setToast({
        show: false,
        message: "",
        type: "success"
      });
    }, 3000);
  };

  const [resourceBranches, setResourceBranches] = useState([]);
  const [resourceBranch, setResourceBranch] = useState(null);
  const [resourceDivisions, setResourceDivisions] = useState([]);
  const [resourceSubject, setResourceSubject] = useState(null);
  const [resources, setResources] = useState(() => {
    const saved = localStorage.getItem("smartBuddyResources");
    return saved ? JSON.parse(saved) : [];
  });

  const [resourceTitle, setResourceTitle] = useState("");
  const [resourceType, setResourceType] = useState("Notes");
  const [resourceDivision, setResourceDivision] = useState("A");
  const [resourceLink, setResourceLink] = useState("");
  const [resourceDescription, setResourceDescription] = useState("");
  const [resourceFile, setResourceFile] = useState(null);

  useEffect(() => {
    localStorage.setItem(
      "smartBuddyResources",
      JSON.stringify(resources)
    );
  }, [resources]);
  const [calendarDate, setCalendarDate] =
    useState(new Date());

  const [selectedCalendarDate, setSelectedCalendarDate] =
    useState(null);

  const [calendarNote, setCalendarNote] =
    useState("");
  const [tasks, setTasks] = useState(initialTasks);
  const [dashboardData, setDashboardData] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const stats = await fetchDashboardStats();
        const activity = await fetchRecentActivity();

        setDashboardData(stats);
        setRecentActivity(activity);
      } catch (error) {
        console.log("API connection failed:", error);
      }
    };

    loadDashboardData();
  }, []);

  const [search, setSearch] = useState("");
  const [newTask, setNewTask] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newSubject, setNewSubject] = useState("");

  const [notes, setNotes] = useState([
    "DBMS important questions",
    "CN experiment 6 notes",
    "Java practical preparation",
  ]);

  const addTask = async () => {
    if (!newTask.trim() || !newDate) {
      showToast("Please enter assignment title and due date.", "error");
      return;
    }

    const taskData = {
      title: newTask.trim(),
      due: newDate,
      subject: newSubject || "General",
      status: "Pending"
    };

    try {
      const savedTask = await addTaskAPI(taskData);

      setTasks((prevTasks) => [
        ...prevTasks,
        savedTask || {
          id: Date.now(),
          ...taskData
        }
      ]);
    } catch (error) {
      console.log("Backend not connected. Saving assignment locally.");

      setTasks((prevTasks) => [
        ...prevTasks,
        {
          id: Date.now(),
          ...taskData
        }
      ]);
    }

    setNewTask("");
    setNewDate("");
    setNewSubject("");

    showToast("Assignment added successfully!", "success");
  };

  const [newNote, setNewNote] = useState("");

  const [mySpaceText, setMySpaceText] = useState("");

  const [mySpaceNotes, setMySpaceNotes] = useState(() => {
    const saved = localStorage.getItem("smartBuddyMySpace");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(
      "smartBuddyMySpace",
      JSON.stringify(mySpaceNotes)
    );
  }, [mySpaceNotes]);

  const saveMySpaceNote = () => {
    if (!mySpaceText.trim()) return;

    const newSpaceNote = {
      id: Date.now(),
      text: mySpaceText.trim(),
      date: new Date().toLocaleDateString()
    };

    setMySpaceNotes((oldNotes) => [newSpaceNote, ...oldNotes]);
    setMySpaceText("");
  };

  const deleteMySpaceNote = (id) => {
    setMySpaceNotes((oldNotes) =>
      oldNotes.filter((note) => note.id !== id)
    );
  };

  const [attendance, setAttendance] = useState(90);
  const [attendanceFile, setAttendanceFile] = useState(null);
  const [attendanceUploaded, setAttendanceUploaded] = useState(false);
  const [attendanceUpdatedAt, setAttendanceUpdatedAt] = useState("");

  const login = async (e) => {
    e.preventDefault();

    if (!userId.trim() || !password.trim()) {
      setLoginError("Please enter User ID and Password.");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:8080/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email: userId.trim(),
            password: password,
            role: role
          })
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setLoginError(
          typeof data === "string"
            ? data
            : "Login failed."
        );
        return;
      }

      /* Save login information */
      localStorage.setItem("token", data.token);

      localStorage.setItem(
        "smartBuddyCurrentUser",
        JSON.stringify(data)
      );

      /* Set logged-in account */
      setRole(data.role || role);
      setUserId(data.email || userId);

      /* Account-specific profile key */
      const accountKey =
        `smartBuddyProfile_${data.role}_${data.email}`;

      const savedProfile =
        localStorage.getItem(accountKey);

      if (savedProfile) {

        const profile =
          JSON.parse(savedProfile);

        setProfileName(
          profile.name || data.name || ""
        );

        setProfileBranch(
          profile.branch ||
          data.branch ||
          "Information Technology"
        );

        setProfileDivision(
          profile.division || "A"
        );

        setDraftProfileName(
          profile.name || data.name || ""
        );

        setDraftProfileBranch(
          profile.branch ||
          data.branch ||
          "Information Technology"
        );

        setDraftProfileDivision(
          profile.division || "A"
        );

      } else {

        /* First login for this account */

        setProfileName(data.name || "");

        setProfileBranch(
          data.branch ||
          "Information Technology"
        );

        setProfileDivision("A");

        setDraftProfileName(data.name || "");

        setDraftProfileBranch(
          data.branch ||
          "Information Technology"
        );

        setDraftProfileDivision("A");
      }

      setProfileSaved(false);
      setLoginError("");
      setLoggedIn(true);

    } catch (error) {

      console.error("Login error:", error);

      setLoginError(
        "Cannot connect to the backend."
      );
    }
  };

  const shareResource = () => {
    if (!resourceTitle.trim()) {
      showToast("Please enter resource title.", "error");
      return;
    }

    if (!resourceSubject) {
      showToast("Please select a subject.", "error");
      return;
    }

    if (!resourceLink.trim() && !resourceFile) {
      showToast("Please add a link or select a file.", "error");
      return;
    }

    const newResource = {
      id: Date.now(),
      title: resourceTitle.trim(),
      type: resourceType,
      branch: resourceBranches,
      division: resourceDivision,
      subject: resourceSubject,
      link: resourceLink.trim(),
      description: resourceDescription.trim(),
      fileName: resourceFile ? resourceFile.name : "",
      fileData: null,
      uploadedBy: profileName,
      createdAt: new Date().toLocaleString("en-IN")
    };

    if (resourceFile) {
      const reader = new FileReader();

      reader.onload = () => {
        newResource.fileData = reader.result;

        setResources((oldResources) => [
          newResource,
          ...oldResources
        ]);

        clearResourceForm();

        showToast("Resource shared successfully!", "success");
      };

      reader.readAsDataURL(resourceFile);
    } else {
      setResources((oldResources) => [
        newResource,
        ...oldResources
      ]);

      clearResourceForm();
      showToast("Resource shared successfully!", "success");
    }
  };

  const clearResourceForm = () => {
    setResourceTitle("");
    setResourceBranches([]);
    setResourceType("Notes");
    setResourceDivisions([]);
    setResourceSubject("");
    setResourceLink("");
    setResourceDescription("");
    setResourceFile(null);
  };

  const register = async (e) => {
    e.preventDefault();

    setRegisterError("");
    setRegisterSuccess("");

    if (
      !registerName.trim() ||
      !registerEmail.trim() ||
      !registerPassword.trim() ||
      !registerBranch.trim()
    ) {
      setRegisterError("Please fill in all fields.");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:8080/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name: registerName.trim(),
            email: registerEmail.trim(),
            password: registerPassword,
            role: role,
            branch: registerBranch
          })
        }
      );

      const data = await response.text();

      if (!response.ok) {
        setRegisterError(data || "Registration failed.");
        return;
      }

      setRegisterSuccess("Registration successful! Please login.");

      // Put registered email into login field
      setUserId(registerEmail.trim());

      // Clear registration fields
      setRegisterName("");
      setRegisterEmail("");
      setRegisterPassword("");
      setRegisterBranch("Information Technology");

      // Go back to login
      setTimeout(() => {
        setShowRegister(false);
        setRegisterSuccess("");
      }, 1000);

    } catch (error) {
      console.error("Registration error:", error);
      setRegisterError("Cannot connect to the backend.");
    }
  };

  const logout = () => {
    setLoggedIn(false);
    setUserId("");
    setPassword("");
    setActiveTab("Dashboard");
  };

  const toggleTask = (id) => {
    setTasks((oldTasks) =>
      oldTasks.map((task) =>
        task.id === id
          ? {
            ...task,
            status:
              task.status === "Completed"
                ? "Pending"
                : "Completed",
          }
          : task
      )
    );
  };

  const addNote = () => {
    if (!newNote.trim()) return;

    setNotes([...notes, newNote]);
    setNewNote("");
  };

  const filteredTasks = tasks.filter((task) => {
    const text =
      `${task.title} ${task.due} ${task.status}`.toLowerCase();

    return text.includes(search.toLowerCase());
  });

  if (!loggedIn) {
    return (
      <div className="login-page">

        <div className="login-left">

          <div className="brand">
            <div className="owl-logo">🦉</div>

            <div>
              <h2>Smart Buddy</h2>
              <span>Plan • Track • Achieve</span>
            </div>
          </div>

          <div className="login-intro">

            <div className="small-pill">
              Your Smart College Companion
            </div>

            <h1>
              Learn smarter.
              <br />
              Stay organized.
              <br />
              <span>Grow together.</span>
            </h1>

            <p>
              Notes, assignments, timetable and academic progress —
              all in one place.
            </p>

          </div>

          <div className="feature-grid">

            <div className="login-feature">
              <span>📚</span>

              <div>
                <b>Smart Study</b>
                <small>
                  Keep notes and study resources organized.
                </small>
              </div>
            </div>

            <div className="login-feature">
              <span>🗓️</span>

              <div>
                <b>Easy Management</b>
                <small>
                  Manage assignments and important updates.
                </small>
              </div>
            </div>

            <div className="login-feature">
              <span>📊</span>

              <div>
                <b>Track Progress</b>
                <small>
                  Monitor attendance and academic progress.
                </small>
              </div>
            </div>

            <div className="login-feature">
              <span>✨</span>

              <div>
                <b>AI Assistance</b>
                <small>
                  Get quick help whenever you need it.
                </small>
              </div>
            </div>

          </div>
        </div>

        <div className="login-right">

          <form
            className="login-card"
            onSubmit={showRegister ? register : login}
          >

            <div className="login-card-logo">🦉</div>

            {!showRegister ? (
              <>
                <h2>Welcome back</h2>

                <p>
                  Login to continue to Smart Buddy
                </p>

                <div className="role-switch">

                  <button
                    type="button"
                    className={
                      role === "Student"
                        ? "role-active"
                        : ""
                    }
                    onClick={() => setRole("Student")}
                  >
                    Student
                  </button>

                  <button
                    type="button"
                    className={
                      role === "Faculty"
                        ? "role-active"
                        : ""
                    }
                    onClick={() => setRole("Faculty")}
                  >
                    Faculty
                  </button>

                </div>

                <label>User ID</label>

                <input
                  type="text"
                  placeholder="Enter your User ID"
                  value={userId}
                  onChange={(e) =>
                    setUserId(e.target.value)
                  }
                />

                <label>Password</label>
                <div className="password-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "🙈" : "👁"}
                  </button>
                </div>
                <div className="login-options">

                  <label className="remember">

                    <input type="checkbox" />

                    <span>
                      Remember me
                    </span>

                  </label>



                </div>

                {loginError && (
                  <div className="login-error">
                    {loginError}
                  </div>
                )}

                <button
                  className="login-button"
                  type="submit"
                >
                  Login as {role} →
                </button>

                <div
                  style={{
                    textAlign: "center",
                    marginTop: "18px",
                    fontSize: "14px"
                  }}
                >
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setShowRegister(true);
                      setRegisterError("");
                      setRegisterSuccess("");
                    }}
                    style={{
                      border: "none",
                      background: "none",
                      padding: 0,
                      fontWeight: "600",
                      cursor: "pointer",
                      color: "#2563eb"
                    }}
                  >
                    Register
                  </button>
                </div>

                <div className="login-footer">
                  Learn smarter. Stay organized. Grow together.
                </div>
              </>
            ) : (
              <>
                <h2>Create Account</h2>

                <p>
                  Register to start using Smart Buddy
                </p>

                <div className="role-switch">

                  <button
                    type="button"
                    className={
                      role === "Student"
                        ? "role-active"
                        : ""
                    }
                    onClick={() => setRole("Student")}
                  >
                    Student
                  </button>

                  <button
                    type="button"
                    className={
                      role === "Faculty"
                        ? "role-active"
                        : ""
                    }
                    onClick={() => setRole("Faculty")}
                  >
                    Faculty
                  </button>

                </div>

                <label>Full Name</label>

                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={registerName}
                  onChange={(e) =>
                    setRegisterName(e.target.value)
                  }
                />

                <label>Email / User ID</label>

                <input
                  type="email"
                  placeholder="Enter your email"
                  value={registerEmail}
                  onChange={(e) =>
                    setRegisterEmail(e.target.value)
                  }
                />

                <label>Password</label>

                <div className="password-wrapper">
                  <input
                    type={showRegisterPassword ? "text" : "password"}
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowRegisterPassword(!showRegisterPassword)
                    }
                  >
                    {showRegisterPassword ? "🙈" : "👁"}
                  </button>
                </div>

                <label>Branch</label>

                <input
                  type="text"
                  placeholder="Enter your branch"
                  value={registerBranch}
                  onChange={(e) =>
                    setRegisterBranch(e.target.value)
                  }
                />

                {registerError && (
                  <div className="login-error">
                    {registerError}
                  </div>
                )}

                {registerSuccess && (
                  <div
                    style={{
                      color: "#15803d",
                      background: "#dcfce7",
                      padding: "10px",
                      borderRadius: "8px",
                      marginTop: "10px",
                      fontSize: "14px",
                      textAlign: "center"
                    }}
                  >
                    {registerSuccess}
                  </div>
                )}

                <button
                  className="login-button"
                  type="submit"
                >
                  Create Account →
                </button>

                <div
                  style={{
                    textAlign: "center",
                    marginTop: "18px",
                    fontSize: "14px"
                  }}
                >
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setShowRegister(false);
                      setRegisterError("");
                      setRegisterSuccess("");
                    }}
                    style={{
                      border: "none",
                      background: "none",
                      padding: 0,
                      fontWeight: "600",
                      cursor: "pointer",
                      color: "#2563eb"
                    }}
                  >
                    Login
                  </button>
                </div>

                <div className="login-footer">
                  Learn smarter. Stay organized. Grow together.
                </div>
              </>
            )}

          </form>

        </div>

      </div>
    );
  }
  return (

    <>
      {toast.show && (
        <div className={`smart-toast ${toast.type}`}>
          <span className="toast-icon">
            {toast.type === "success" ? "✓" : "!"}
          </span>

          <span>{toast.message}</span>
        </div>
      )}

      <div className="app-layout"></div>



      {/* SIDEBAR */}

      <aside className="sidebar">

        <div className="sidebar-brand">

          <div className="sidebar-logo">
            🦉
          </div>

          <div>
            <h2>Smart Buddy</h2>
            <span>Plan • Track • Achieve</span>
          </div>

        </div>

        <nav className="sidebar-nav">

          {(role === "Faculty"
            ? [
              ["Dashboard", "⌂"],
              ["Manage Attendance", "📊"],
              ["Manage Resources", "📚"],
              ["Send Updates", "📢"],
              ["Student Progress", "📈"],
              ["Calendar", "▦"],
              ["Settings", "⚙"],
            ]
            : [
              ["Dashboard", "⌂"],
              ["Assignments", "▣"],
              ["Calendar", "▦"],
              ["Timetable", "▤"],
              ["Notes", "▤"],
              ["Attendance", "▥"],
              ["My Progress", "◩"],
              ["Resources", "◈"],
              ["Settings", "⚙"],
            ]
          ).map(([name, icon]) => (

            <button
              key={name}
              className={
                activeTab === name
                  ? "nav-item active"
                  : "nav-item"
              }
              onClick={() => setActiveTab(name)}
            >
              <span>{icon}</span>
              {name}
            </button>

          ))}

        </nav>

        <div className="sidebar-bottom">

          <button
            className="logout"
            onClick={logout}
          >
            ↪ Logout
          </button>

          <p>
            “Small steps
            <br />
            every day lead
            <br />
            to big results.”
          </p>

        </div>

      </aside >

      {/* MAIN */}

      <main className="main-area">

        {/* TOP BAR */}

        <header className="topbar">

          <div className="search-box">

            <span>⌕</span>

            <input
              placeholder="Search assignments, notes, or resources..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

          </div>

          <div className="top-right">

            <span className="date">
              Mon, 7 Sept 2026
            </span>

            <span className="bell">
              ♧
            </span>

            <div className="student-profile">

              <div className="profile-circle">
                {profileName.charAt(0).toUpperCase()}
              </div>

              <div>
                <b>{profileName}</b>

                <span>
                  {role === "Faculty"
                    ? "Faculty"
                    : "B.E. IT"}
                </span>
              </div>

              <span>⌄</span>

            </div>

          </div>

        </header >

        {/* CONTENT */}

        <section className="content">

          {/* DASHBOARD */}

          {
            activeTab === "Dashboard" && (

              role === "Faculty" ? (

                <div className="faculty-dashboard">

                  <div className="welcome-banner">

                    <div>

                      <h1>
                        Welcome back, Faculty!{" "}
                        <span>👋</span>
                      </h1>

                      <p>
                        Manage resources, attendance,
                        updates and student progress.
                      </p>

                    </div>

                    <div className="banner-text">
                      Guide
                      <br />
                      Support
                      <br />
                      Inspire
                      <div>━━</div>
                    </div>

                  </div>

                  <div className="faculty-stats">

                    <div className="faculty-stat-card">
                      <span>📚</span>

                      <div>
                        <strong>5</strong>
                        <p>My Subjects</p>
                      </div>
                    </div>

                    <div className="faculty-stat-card">
                      <span>📢</span>

                      <div>
                        <strong>3</strong>
                        <p>Recent Updates</p>
                      </div>
                    </div>

                    <div className="faculty-stat-card">
                      <span>📊</span>

                      <div>
                        <strong>102</strong>
                        <p>Students</p>
                      </div>
                    </div>

                    <div className="faculty-stat-card">
                      <span>📈</span>

                      <div>
                        <strong>83%</strong>
                        <p>Class Progress</p>
                      </div>
                    </div>

                  </div>

                  <div className="faculty-action-grid">

                    <button
                      className="faculty-action-card"
                      onClick={() =>
                        setActiveTab("Manage Resources")
                      }
                    >
                      <span>📚</span>

                      <div>
                        <h3>Manage Resources</h3>
                        <p>
                          Upload notes, files, images,
                          links and timetable.
                        </p>
                      </div>

                      <b>→</b>
                    </button>

                    <button
                      className="faculty-action-card"
                      onClick={() =>
                        setActiveTab("Send Updates")
                      }
                    >
                      <span>📢</span>

                      <div>
                        <h3>Send Updates</h3>
                        <p>
                          Send important announcements
                          to students.
                        </p>
                      </div>

                      <b>→</b>
                    </button>

                    <button
                      className="faculty-action-card"
                      onClick={() =>
                        setActiveTab("Manage Attendance")
                      }
                    >
                      <span>📊</span>

                      <div>
                        <h3>Manage Attendance</h3>
                        <p>
                          Share and update attendance
                          for your subjects.
                        </p>
                      </div>

                      <b>→</b>
                    </button>

                    <button
                      className="faculty-action-card"
                      onClick={() =>
                        setActiveTab("Student Progress")
                      }
                    >
                      <span>📈</span>

                      <div>
                        <h3>Student Progress</h3>
                        <p>
                          Check academic progress
                          of your students.
                        </p>
                      </div>

                      <b>→</b>
                    </button>

                  </div>

                  <div className="faculty-info-panel">

                    <div>
                      <h2>Faculty Workspace</h2>

                      <p>
                        Use Smart Buddy to manage your
                        academic resources, communicate
                        with students and monitor their
                        progress.
                      </p>
                    </div>

                    <span>🎓</span>

                  </div>

                </div>

              ) : (

                <>
                  <div className="welcome-banner">

                    <div>

                      <h1>
                        Welcome back,{role}!{" "}
                        <span>👋</span>
                      </h1>

                      <p>
                        “Stay focused, keep learning,
                        you're doing great.”
                      </p>

                    </div>

                    <div className="banner-text">
                      Organise
                      <br />
                      Learn
                      <br />
                      Achieve
                      <div>━━</div>
                    </div>

                  </div>

                  <div className="stats">

                    <div className="stat-card pink">

                      <span className="stat-icon">
                        ▣
                      </span>

                      <div>
                        <strong>
                          {
                            tasks.filter(
                              (t) =>
                                t.status === "Pending"
                            ).length
                          }
                        </strong>

                        <p>Pending Tasks</p>
                      </div>

                    </div>

                    <div className="stat-card green">

                      <span className="stat-icon">
                        ✓
                      </span>

                      <div>
                        <strong>
                          {
                            tasks.filter(
                              (t) =>
                                t.status === "Completed"
                            ).length
                          }
                        </strong>

                        <p>Completed</p>
                      </div>

                    </div>

                    <div className="stat-card purple">

                      <span className="stat-icon">
                        ▥
                      </span>

                      <div>
                        <strong>
                          {attendance}%
                        </strong>

                        <p>Attendance</p>
                      </div>

                    </div>

                    <div className="stat-card blue">

                      <span className="stat-icon">
                        ★
                      </span>

                      <div>
                        <strong>4.5</strong>
                        <p>CGPA</p>
                      </div>

                    </div>

                  </div>

                  <div className="dashboard-grid">

                    <div className="panel assignment-panel">

                      <div className="panel-heading">

                        <h2>
                          ▣ Assignment Tracker
                        </h2>

                        <button
                          onClick={() =>
                            setActiveTab("Assignments")
                          }
                        >
                          View All
                        </button>

                      </div>

                      {filteredTasks.map((task) => (

                        <div
                          className="task-row"
                          key={task.id}
                        >

                          <input
                            type="checkbox"
                            checked={
                              task.status === "Completed"
                            }
                            onChange={() =>
                              toggleTask(task.id)
                            }
                          />

                          <div className="task-details">

                            <b
                              className={
                                task.status === "Completed"
                                  ? "done-text"
                                  : ""
                              }
                            >
                              {task.title}
                            </b>

                            <span>
                              Due: {task.due}
                            </span>

                          </div>

                          <span
                            className={
                              task.status === "Completed"
                                ? "status completed"
                                : "status pending"
                            }
                          >
                            {task.status}
                          </span>
                          <button
                            className="delete-assignment-btn"
                            onClick={() => {
                              const updatedTasks = tasks.filter(
                                (item) => item.id !== task.id
                              );

                              setTasks(updatedTasks);

                              localStorage.setItem(
                                "smartBuddyTasks",
                                JSON.stringify(updatedTasks)
                              );
                            }}
                          >
                            Delete
                          </button>

                        </div>

                      ))}

                    </div>

                    <div className="panel activity-panel">

                      <div className="panel-heading">

                        <h2>
                          ◷ Recent Activity
                        </h2>

                        <button>
                          View All
                        </button>

                      </div>

                      <div className="activity">
                        <span className="dot green-dot"></span>

                        <div>
                          <b>ED notes added</b>
                          <small>2 hours ago</small>
                        </div>
                      </div>

                      <div className="activity">
                        <span className="dot green-dot"></span>

                        <div>
                          <b>
                            Marked DBMS as complete
                          </b>
                          <small>5 hours ago</small>
                        </div>
                      </div>

                      <div className="activity">
                        <span className="dot blue-dot"></span>

                        <div>
                          <b>
                            Attendance updated
                          </b>
                          <small>6 hours ago</small>
                        </div>
                      </div>

                      <div className="activity">
                        <span className="dot purple-dot"></span>

                        <div>
                          <b>New note added</b>
                          <small>1 day ago</small>
                        </div>
                      </div>

                      <div className="activity">
                        <span className="dot pink-dot"></span>

                        <div>
                          <b>
                            Assignment submitted
                          </b>
                          <small>1 day ago</small>
                        </div>
                      </div>

                    </div>

                  </div>

                  <div className="my-space-panel">

                    <div className="my-space-header">

                      <div>
                        <h2>📝 My Space</h2>

                        <p>
                          Your personal space for notes,
                          ideas and reminders.
                        </p>
                      </div>

                      <span className="my-space-label">
                        Personal
                      </span>

                    </div>

                    <div className="my-space-editor">

                      <textarea
                        placeholder="Write anything you want to remember..."
                        value={mySpaceText}
                        onChange={(e) =>
                          setMySpaceText(e.target.value)
                        }
                      />

                      <div className="my-space-footer">

                        <span>
                          ✦ Your thoughts, your space
                        </span>

                        <button
                          onClick={saveMySpaceNote}
                        >
                          Save Note
                        </button>

                      </div>

                    </div>

                    {mySpaceNotes.length > 0 && (

                      <div className="my-space-saved">

                        {mySpaceNotes.map((note) => (

                          <div
                            className="saved-space-note"
                            key={note.id}
                          >

                            <div>

                              <p>
                                {note.text}
                              </p>

                              <small>
                                {note.date}
                              </small>

                            </div>

                            <button
                              onClick={() =>
                                deleteMySpaceNote(note.id)
                              }
                            >
                              ×
                            </button>

                          </div>

                        ))}

                      </div>

                    )}

                  </div>
                </>

              )
            )
          }

          {/* ASSIGNMENTS */}

          {
            activeTab === "Assignments" && (

              <Page title="Assignments">

                <div className="full-panel">

                  <h2>Assignment Tracker</h2>

                  {tasks.map((task) => (

                    <div
                      className="large-task"
                      key={task.id}
                    >

                      <input
                        type="checkbox"
                        checked={
                          task.status === "Completed"
                        }
                        onChange={() =>
                          toggleTask(task.id)
                        }
                      />

                      <div>
                        <b>{task.title}</b>
                        <span>Due: {task.due}</span>
                      </div>

                      <span
                        className={
                          task.status === "Completed"
                            ? "status completed"
                            : "status pending"
                        }
                      >
                        {task.status}
                      </span>

                    </div>

                  ))}

                  <div className="add-assignment">

                    <input
                      placeholder="New assignment..."
                      value={newTask}
                      onChange={(e) =>
                        setNewTask(e.target.value)
                      }
                    />

                    <input
                      type="date"
                      value={newDate}
                      onChange={(e) =>
                        setNewDate(e.target.value)
                      }
                    />

                    <button onClick={addTask}>
                      Add Assignment
                    </button>

                  </div>

                </div>

              </Page>
            )
          }

          {/* CALENDAR */}

          {
            activeTab === "Calendar" && (
              <Page title="Calendar">

                <div className="calendar-panel">

                  {/* Calendar Header */}
                  <div className="calendar-header">

                    <button
                      className="calendar-nav-btn"
                      onClick={() =>
                        setCalendarDate(
                          new Date(
                            calendarDate.getFullYear(),
                            calendarDate.getMonth() - 1,
                            1
                          )
                        )
                      }
                    >
                      ←
                    </button>

                    <h2>
                      {calendarDate.toLocaleString("en-US", {
                        month: "long",
                        year: "numeric"
                      })}
                    </h2>

                    <button
                      className="calendar-nav-btn"
                      onClick={() =>
                        setCalendarDate(
                          new Date(
                            calendarDate.getFullYear(),
                            calendarDate.getMonth() + 1,
                            1
                          )
                        )
                      }
                    >
                      →
                    </button>

                  </div>

                  {/* Calendar Actions */}
                  <div className="calendar-actions">

                    <button
                      className="calendar-today-btn"
                      onClick={() => {
                        const today = new Date();

                        setCalendarDate(
                          new Date(
                            today.getFullYear(),
                            today.getMonth(),
                            1
                          )
                        );

                        setSelectedCalendarDate(today);
                      }}
                    >
                      Today
                    </button>

                    <input
                      type="date"
                      className="calendar-date-input"
                      value={
                        selectedCalendarDate
                          ? `${selectedCalendarDate.getFullYear()}-${String(
                            selectedCalendarDate.getMonth() + 1
                          ).padStart(2, "0")}-${String(
                            selectedCalendarDate.getDate()
                          ).padStart(2, "0")}`
                          : ""
                      }
                      onChange={(e) => {
                        if (!e.target.value) return;

                        const [year, month, day] =
                          e.target.value.split("-").map(Number);

                        const selectedDate = new Date(
                          year,
                          month - 1,
                          day
                        );

                        setCalendarDate(
                          new Date(year, month - 1, 1)
                        );

                        setSelectedCalendarDate(selectedDate);
                      }}
                    />

                  </div>

                  {/* Calendar */}
                  <div className="calendar-grid">

                    {[
                      "Sun",
                      "Mon",
                      "Tue",
                      "Wed",
                      "Thu",
                      "Fri",
                      "Sat"
                    ].map((day) => (
                      <b key={day}>{day}</b>
                    ))}

                    {Array.from({
                      length: new Date(
                        calendarDate.getFullYear(),
                        calendarDate.getMonth(),
                        1
                      ).getDay()
                    }).map((_, index) => (
                      <div
                        className="calendar-empty"
                        key={`empty-${index}`}
                      />
                    ))}

                    {Array.from(
                      {
                        length: new Date(
                          calendarDate.getFullYear(),
                          calendarDate.getMonth() + 1,
                          0
                        ).getDate()
                      },
                      (_, index) => {

                        const day = index + 1;

                        const date = new Date(
                          calendarDate.getFullYear(),
                          calendarDate.getMonth(),
                          day
                        );

                        const isSelected =
                          selectedCalendarDate &&
                          selectedCalendarDate.toDateString() ===
                          date.toDateString();

                        const key = date.toDateString();

                        const savedNotes =
                          JSON.parse(
                            localStorage.getItem(
                              "smartBuddyCalendarNotes"
                            )
                          ) || {};

                        const hasNote = !!savedNotes[key];

                        return (
                          <button
                            key={day}
                            className={
                              isSelected
                                ? "calendar-day calendar-selected"
                                : "calendar-day"
                            }
                            onClick={() => {
                              setSelectedCalendarDate(date);
                              setCalendarNote(
                                savedNotes[key] || ""
                              );
                            }}
                          >
                            <span>{day}</span>

                            {hasNote && (
                              <small className="calendar-note-dot">
                                •
                              </small>
                            )}
                          </button>
                        );
                      }
                    )}

                  </div>

                  {/* Note Section */}
                  {selectedCalendarDate && (
                    <div className="calendar-note-box">

                      <div className="calendar-note-header">
                        <div>
                          <span className="calendar-note-icon">
                            📝
                          </span>

                          <div>
                            <h3>Daily Note</h3>

                            <p>
                              {selectedCalendarDate.toLocaleDateString(
                                "en-US",
                                {
                                  weekday: "long",
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric"
                                }
                              )}
                            </p>
                          </div>
                        </div>
                      </div>

                      <textarea
                        placeholder="Write your note for this day..."
                        value={calendarNote}
                        onChange={(e) =>
                          setCalendarNote(e.target.value)
                        }
                      />

                      <div className="calendar-note-buttons">

                        <button
                          className="calendar-save-btn"
                          onClick={() => {
                            const key =
                              selectedCalendarDate.toDateString();

                            const notes =
                              JSON.parse(
                                localStorage.getItem(
                                  "smartBuddyCalendarNotes"
                                )
                              ) || {};

                            if (!calendarNote.trim()) {
                              alert("Please write a note first.");
                              return;
                            }

                            notes[key] =
                              calendarNote.trim();

                            localStorage.setItem(
                              "smartBuddyCalendarNotes",
                              JSON.stringify(notes)
                            );

                            alert("Note saved successfully!");
                          }}
                        >
                          ✓ Save Note
                        </button>

                        <button
                          className="calendar-delete-btn"
                          onClick={() => {
                            const key =
                              selectedCalendarDate.toDateString();

                            const notes =
                              JSON.parse(
                                localStorage.getItem(
                                  "smartBuddyCalendarNotes"
                                )
                              ) || {};

                            delete notes[key];

                            localStorage.setItem(
                              "smartBuddyCalendarNotes",
                              JSON.stringify(notes)
                            );

                            setCalendarNote("");

                            alert("Note deleted.");
                          }}
                        >
                          🗑 Delete Note
                        </button>

                      </div>

                    </div>
                  )}

                </div>

              </Page>
            )
          }

          {/* TIMETABLE */}

          {
            activeTab === "Timetable" && (

              <Page title="Timetable">

                <div className="timetable-page">

                  <div className="timetable-header">

                    <div>
                      <h2>Class Timetable</h2>

                      <p>
                        Select branch and division
                        to view the timetable.
                      </p>
                    </div>

                    <button
                      className="timetable-download-btn"
                      onClick={() =>
                        window.print()
                      }
                    >
                      ⬇ Download Timetable
                    </button>

                  </div>

                  <div className="timetable-filters">

                    <div className="timetable-field">

                      <label>Branch</label>

                      <select>

                        <option>
                          Information Technology
                        </option>

                        <option>
                          Computer Engineering
                        </option>

                        <option>
                          Artificial Intelligence & Data Science
                        </option>

                        <option>
                          Electronics & Telecommunication
                        </option>

                        <option>
                          Mechanical Engineering
                        </option>

                      </select>

                    </div>

                    <div>
                      <label>Divisions</label>

                      <div className="resource-division-checkboxes">

                        {["A", "B", "C", "D"].map((division) => (

                          <label
                            key={division}
                            className="resource-division-checkbox"
                          >
                            <input
                              type="checkbox"
                              checked={resourceDivisions.includes(division)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setResourceDivisions([
                                    ...resourceDivisions,
                                    division
                                  ]);
                                } else {
                                  setResourceDivisions(
                                    resourceDivisions.filter(
                                      (item) => item !== division
                                    )
                                  );
                                }
                              }}
                            />

                            <span>Division {division}</span>
                          </label>

                        ))}

                      </div>
                    </div>

                  </div>

                  <div className="timetable-note">

                    <span>ⓘ</span>

                    <p>
                      Timetable is provided and
                      updated by the faculty through
                      Resources.
                    </p>

                  </div>

                </div>

              </Page>
            )
          }

          {/* NOTES */}

          {
            activeTab === "Notes" && (

              <Page title="Notes">

                <div className="full-panel">

                  <h2>My Notes</h2>

                  {notes.map((note, index) => (

                    <div
                      className="note-card"
                      key={index}
                    >
                      📝 {note}
                    </div>

                  ))}

                </div>

              </Page>
            )
          }

          {/* STUDENT ATTENDANCE */}

          {
            activeTab === "Attendance" && (

              <Page title="Attendance">

                <div className="full-panel attendance-page">

                  <div className="attendance-header">

                    <div>
                      <h2>Attendance Overview</h2>

                      <p>
                        Your attendance is updated
                        by the faculty.
                      </p>
                    </div>

                    <div className="attendance-readonly">
                      🔒 Read Only
                    </div>

                  </div>

                  <div className="attendance-summary">

                    <div className="attendance-summary-card">
                      <span>Total Classes</span>
                      <strong>82</strong>
                    </div>

                    <div className="attendance-summary-card">
                      <span>Classes Present</span>
                      <strong>70</strong>
                    </div>

                    <div className="attendance-summary-card overall-attendance">
                      <span>Overall Attendance</span>
                      <strong>85.4%</strong>
                    </div>

                  </div>

                  <div className="attendance-table-wrapper">

                    <table className="attendance-table">

                      <thead>

                        <tr>
                          <th>Subject</th>
                          <th>Present</th>
                          <th>Total Classes</th>
                          <th>Attendance</th>
                        </tr>

                      </thead>

                      <tbody>

                        <tr>
                          <td>ADSA</td>
                          <td>18</td>
                          <td>20</td>
                          <td className="attendance-good">
                            90%
                          </td>
                        </tr>

                        <tr>
                          <td>Java</td>
                          <td>16</td>
                          <td>20</td>
                          <td className="attendance-average">
                            80%
                          </td>
                        </tr>

                        <tr>
                          <td>DBMS</td>
                          <td>19</td>
                          <td>22</td>
                          <td className="attendance-good">
                            86.4%
                          </td>
                        </tr>

                        <tr>
                          <td>ED</td>
                          <td>17</td>
                          <td>20</td>
                          <td className="attendance-good">
                            85%
                          </td>
                        </tr>

                        <tr>
                          <td>FSJP</td>
                          <td>15</td>
                          <td>20</td>
                          <td className="attendance-low">
                            75%
                          </td>
                        </tr>

                      </tbody>

                      <tfoot>

                        <tr>
                          <td>
                            <strong>Total</strong>
                          </td>

                          <td>
                            <strong>85</strong>
                          </td>

                          <td>
                            <strong>102</strong>
                          </td>

                          <td>
                            <strong>83.3%</strong>
                          </td>
                        </tr>

                      </tfoot>

                    </table>

                  </div>

                  {/* SHARED ATTENDANCE SHEET */}

                  {attendanceUploaded &&
                    attendanceFile && (

                      <div className="student-shared-attendance">

                        <div className="student-shared-attendance-icon">
                          📄
                        </div>

                        <div className="student-shared-attendance-info">

                          <h3>
                            Latest Attendance Sheet
                          </h3>

                          <p>
                            {attendanceFile.name}
                          </p>

                          <span>
                            🕒 Updated:{" "}
                            {attendanceUpdatedAt}
                          </span>

                        </div>

                        <button
                          className="student-view-attendance-btn"
                          onClick={() => {
                            window.open(
                              URL.createObjectURL(
                                attendanceFile
                              ),
                              "_blank"
                            );
                          }}
                        >
                          View Sheet
                        </button>

                      </div>

                    )}

                  <div className="attendance-note">

                    <span>ⓘ</span>

                    <p>
                      Attendance can only be updated
                      by faculty. Students can view
                      their attendance but cannot
                      modify it.
                    </p>

                  </div>

                </div>

              </Page>
            )
          }

          {/* FACULTY MANAGE ATTENDANCE */}

          {
            activeTab === "Manage Attendance" &&
            role === "Faculty" && (

              <Page title="Manage Attendance">

                <div className="full-panel faculty-attendance-page">

                  <div className="attendance-header">

                    <div>

                      <h2>
                        Share Attendance Sheet
                      </h2>

                      <p>
                        Upload the latest attendance
                        sheet from your laptop.
                        Students will be able to view
                        the updated sheet.
                      </p>

                    </div>

                    <div className="attendance-readonly">
                      📁 Faculty Upload
                    </div>

                  </div>

                  <div className="attendance-upload-form">

                    <div className="attendance-field">

                      <label>Subject</label>

                      <select defaultValue="">

                        <option
                          value=""
                          disabled
                        >
                          Select Subject
                        </option>

                        <option>ADSA</option>
                        <option>Java</option>
                        <option>DBMS</option>
                        <option>FSJP</option>
                        <option>ED</option>

                      </select>

                    </div>

                    <div className="attendance-field">

                      <label>Division</label>

                      <select defaultValue="">

                        <option
                          value=""
                          disabled
                        >
                          Select Division
                        </option>

                        <option>A</option>
                        <option>B</option>
                        <option>C</option>

                      </select>

                    </div>

                    <div className="attendance-field">

                      <label>
                        Attendance Type
                      </label>

                      <select defaultValue="">

                        <option
                          value=""
                          disabled
                        >
                          Select Type
                        </option>

                        <option>
                          Lecture
                        </option>

                        <option>
                          Practical
                        </option>

                      </select>

                    </div>

                  </div>

                  <div className="attendance-file-box">

                    <div className="attendance-file-icon">
                      📊
                    </div>

                    <div>

                      <h3>
                        Upload Attendance Sheet
                      </h3>

                      <p>
                        Upload the actual attendance
                        sheet taken by the faculty.
                      </p>

                      <small>
                        Supported formats:
                        XLSX, XLS, CSV, PDF
                      </small>

                    </div>

                    <label className="attendance-upload-btn">

                      ⬆ Upload Sheet

                      <input
                        type="file"
                        accept=".xlsx,.xls,.csv,.pdf"
                        style={{
                          display: "none"
                        }}
                        onChange={(e) => {

                          const selectedFile =
                            e.target.files?.[0];

                          if (selectedFile) {

                            setAttendanceFile(
                              selectedFile
                            );

                            setAttendanceUploaded(
                              false
                            );

                            setAttendanceUpdatedAt(
                              ""
                            );
                          }

                        }}
                      />

                    </label>

                  </div>

                  {attendanceFile && (

                    <div className="selected-attendance-file">

                      <div className="attendance-selected-icon">
                        📄
                      </div>

                      <div className="attendance-selected-info">

                        <strong>
                          {attendanceFile.name}
                        </strong>

                        <p>
                          File selected and ready
                          to share.
                        </p>

                      </div>

                      <button
                        type="button"
                        className="share-attendance-btn"
                        onClick={() => {

                          setAttendanceUploaded(
                            true
                          );

                          setAttendanceUpdatedAt(
                            new Date().toLocaleString(
                              "en-IN",
                              {
                                dateStyle: "medium",
                                timeStyle: "short",
                              }
                            )
                          );

                        }}
                      >
                        Share with Students
                      </button>

                    </div>

                  )}

                  {/* LATEST ATTENDANCE SHEET */}

                  <div className="latest-attendance-card">

                    <div>

                      <h3>
                        Latest Attendance Sheet
                      </h3>

                      <p>
                        ADSA • Division A • Lecture
                        {attendanceFile &&
                          ` • ${attendanceFile.name}`}
                      </p>

                      <span>
                        🕒 Last updated:{" "}
                        {attendanceUpdatedAt ||
                          "No updated sheet yet"}
                      </span>

                      {attendanceUploaded && (

                        <div className="attendance-success">
                          ✓ Attendance sheet shared
                          with students.
                        </div>

                      )}

                    </div>

                    <button
                      className="attendance-view-btn"
                      onClick={() => {

                        if (attendanceFile) {

                          window.open(
                            URL.createObjectURL(
                              attendanceFile
                            ),
                            "_blank"
                          );

                        } else {

                          alert(
                            "Please upload an attendance sheet first."
                          );

                        }

                      }}
                    >
                      View Sheet
                    </button>

                  </div>

                  <div className="attendance-info">

                    <span>ⓘ</span>

                    <p>
                      Faculty members do not mark
                      attendance inside Smart Buddy.
                      They upload the real attendance
                      sheet after taking attendance.
                      Students can view the latest
                      updated sheet in their
                      Attendance section.
                    </p>

                  </div>

                </div>

              </Page>
            )
          }

          {
            activeTab === "Manage Resources" && role === "Faculty" && (
              <Page title="Manage Resources">

                <div className="resources-page">

                  <div className="resources-header">
                    <h2>Manage Resources</h2>
                    <p>
                      Share notes, PDFs, links and study material with students.
                    </p>
                  </div>

                  <div className="faculty-resource-upload-card">

                    <h3>Share New Resource</h3>

                    <div className="resource-manager-grid">

                      <div>
                        <label>Resource Title</label>

                        <input
                          type="text"
                          placeholder="e.g. ADSA Unit 1 Notes"
                          value={resourceTitle}
                          onChange={(e) =>
                            setResourceTitle(e.target.value)
                          }
                        />
                      </div>

                      <div>
                        <label>Branches</label>

                        <div className="resource-branch-checkboxes">

                          {[
                            "Information Technology",
                            "Computer Engineering",
                            "AI & DS",
                            "EXTC",
                            "Mechanical"
                          ].map((branch) => (

                            <label
                              key={branch}
                              className="resource-branch-checkbox"
                            >
                              <input
                                type="checkbox"
                                checked={resourceBranches.includes(branch)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setResourceBranches([
                                      ...resourceBranches,
                                      branch
                                    ]);
                                  } else {
                                    setResourceBranches(
                                      resourceBranches.filter(
                                        (item) => item !== branch
                                      )
                                    );
                                  }
                                }}
                              />

                              <span>{branch}</span>
                            </label>

                          ))}

                        </div>
                      </div>

                      <div>
                        <label>Division</label>

                        <select
                          value={resourceDivision}
                          onChange={(e) =>
                            setResourceDivision(e.target.value)
                          }
                        >
                          <option value="A">Division A</option>
                          <option value="B">Division B</option>
                          <option value="C">Division C</option>
                          <option value="D">Division D</option>
                        </select>
                      </div>

                      <div>
                        <label>Resource Type</label>

                        <select
                          value={resourceType}
                          onChange={(e) =>
                            setResourceType(e.target.value)
                          }
                        >
                          <option value="Notes">Notes</option>
                          <option value="PDF">PDF</option>
                          <option value="Document">Document</option>
                          <option value="Presentation">Presentation</option>
                          <option value="Image">Image</option>
                          <option value="Video">Video</option>
                          <option value="Link">External Link</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                    </div>

                    <div style={{ marginTop: "20px" }}>

                      <label>Resource Link</label>

                      <input
                        type="url"
                        placeholder="Paste Google Drive, YouTube or website link"
                        value={resourceLink}
                        onChange={(e) =>
                          setResourceLink(e.target.value)
                        }
                      />

                      <small>
                        Leave empty if you are uploading a file.
                      </small>

                    </div>

                    <div className="resource-upload-divider">
                      <span>OR</span>
                    </div>

                    <div className="resource-file-upload-box">

                      <div>
                        <strong>Upload File</strong>

                        <p>
                          PDF, document, presentation, image or study material.
                        </p>
                      </div>

                      <label className="resource-file-select-btn">

                        📎 Choose File

                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.png,.jpg,.jpeg"
                          style={{ display: "none" }}
                          onChange={(e) =>
                            setResourceFile(
                              e.target.files?.[0] || null
                            )
                          }
                        />

                      </label>

                    </div>

                    {resourceFile && (
                      <div className="selected-resource-file">
                        📄 {resourceFile.name}
                      </div>
                    )}

                    <div style={{ marginTop: "20px" }}>

                      <label>Description</label>

                      <textarea
                        placeholder="Add a short description"
                        value={resourceDescription}
                        onChange={(e) =>
                          setResourceDescription(e.target.value)
                        }
                      />

                    </div>

                    <div className="resource-share-row">

                      <span>
                        📌 Sharing with:
                        <b> {resourceDivision} Division</b>
                        {" • "}
                        <b>
                          {resourceSubject || "No subject selected"}
                        </b>
                      </span>

                      <button
                        className="share-resource-main-btn"
                        onClick={shareResource}
                      >
                        📤 Share Resource
                      </button>

                    </div>

                  </div>

                  <div className="faculty-resource-list-card">

                    <div className="faculty-resource-list-header">

                      <div>
                        <h3>Shared Resources</h3>

                        <p>
                          Resources already shared by you.
                        </p>
                      </div>

                      <span>
                        {
                          resources.filter(
                            (resource) =>
                              resource.uploadedBy === profileName
                          ).length
                        } Resources
                      </span>

                    </div>

                    {
                      resources.filter(
                        (resource) =>
                          resource.uploadedBy === profileName
                      ).length === 0 ? (

                        <div className="no-shared-resources">

                          <span>📚</span>

                          <h3>No resources shared yet</h3>

                          <p>
                            Your shared resources will appear here.
                          </p>

                        </div>

                      ) : (

                        <div className="faculty-resource-list">

                          {
                            resources
                              .filter(
                                (resource) =>
                                  resource.uploadedBy === profileName
                              )
                              .map((resource) => (

                                <div
                                  className="faculty-resource-item"
                                  key={resource.id}
                                >

                                  <div className="faculty-resource-icon">
                                    {resource.type === "PDF"
                                      ? "PDF"
                                      : resource.type === "Link"
                                        ? "🔗"
                                        : "📚"}
                                  </div>

                                  <div className="faculty-resource-info">

                                    <h4>{resource.title}</h4>

                                    <p>
                                      {resource.subject}
                                      {" • "}
                                      Division {resource.division}
                                      {" • "}
                                      {resource.type}
                                    </p>

                                    <small>
                                      Shared on {resource.createdAt}
                                    </small>

                                  </div>

                                  <button
                                    className="delete-resource-btn"
                                    onClick={() => {
                                      setResources(
                                        resources.filter(
                                          (item) =>
                                            item.id !== resource.id
                                        )
                                      );
                                    }}
                                  >
                                    Delete
                                  </button>

                                </div>

                              ))
                          }

                        </div>

                      )
                    }

                  </div>

                </div>

              </Page>
            )
          }

          {/* MY PROGRESS */}

          {
            activeTab === "My Progress" && (

              <Page title="My Progress">

                <div className="progress-page">

                  <div className="progress-overview">

                    <div className="progress-overview-info">

                      <span className="progress-label">
                        Overall Academic Progress
                      </span>

                      <h2>
                        Good Progress!
                      </h2>

                      <p>
                        Your academic progress is
                        updated by the faculty and
                        displayed here for viewing.
                      </p>

                      <div className="progress-bar-large">

                        <div
                          className="progress-fill-large"
                          style={{
                            width: "83%"
                          }}
                        ></div>

                      </div>

                      <div className="progress-percentage">

                        <strong>
                          83%
                        </strong>

                        <span>
                          Overall Progress
                        </span>

                      </div>

                    </div>

                    <div className="progress-circle">

                      <div>

                        <strong>
                          83%
                        </strong>

                        <span>
                          Progress
                        </span>

                      </div>

                    </div>

                  </div>

                  <div className="progress-summary">

                    <div className="progress-summary-card">

                      <span>
                        Completed
                      </span>

                      <strong>
                        18
                      </strong>

                      <small>
                        Assignments
                      </small>

                    </div>

                    <div className="progress-summary-card">

                      <span>
                        Pending
                      </span>

                      <strong>
                        4
                      </strong>

                      <small>
                        Assignments
                      </small>

                    </div>

                    <div className="progress-summary-card">

                      <span>
                        Attendance
                      </span>

                      <strong>
                        83.3%
                      </strong>

                      <small>
                        Overall
                      </small>

                    </div>

                    <div className="progress-summary-card">

                      <span>
                        Subjects
                      </span>

                      <strong>
                        5
                      </strong>

                      <small>
                        Active Subjects
                      </small>

                    </div>

                  </div>

                  <div className="subject-progress-panel">

                    <div className="progress-section-header">

                      <div>

                        <h2>
                          Subject-wise Progress
                        </h2>

                        <p>
                          Progress based on your
                          academic activities.
                        </p>

                      </div>

                      <span className="progress-readonly">
                        🔒 Read Only
                      </span>

                    </div>

                    <div className="subject-progress-list">

                      <div className="subject-progress-item">

                        <div className="subject-progress-top">

                          <span>
                            ADSA
                          </span>

                          <strong>
                            88%
                          </strong>

                        </div>

                        <div className="subject-progress-bar">

                          <div
                            className="subject-progress-fill"
                            style={{
                              width: "88%"
                            }}
                          ></div>

                        </div>

                      </div>

                      <div className="subject-progress-item">

                        <div className="subject-progress-top">

                          <span>
                            Java
                          </span>

                          <strong>
                            82%
                          </strong>

                        </div>

                        <div className="subject-progress-bar">

                          <div
                            className="subject-progress-fill"
                            style={{
                              width: "82%"
                            }}
                          ></div>

                        </div>

                      </div>

                      <div className="subject-progress-item">

                        <div className="subject-progress-top">

                          <span>
                            DBMS
                          </span>

                          <strong>
                            86%
                          </strong>

                        </div>

                        <div className="subject-progress-bar">

                          <div
                            className="subject-progress-fill"
                            style={{
                              width: "86%"
                            }}
                          ></div>

                        </div>

                      </div>

                      <div className="subject-progress-item">

                        <div className="subject-progress-top">

                          <span>
                            ED
                          </span>

                          <strong>
                            80%
                          </strong>

                        </div>

                        <div className="subject-progress-bar">

                          <div
                            className="subject-progress-fill"
                            style={{
                              width: "80%"
                            }}
                          ></div>

                        </div>

                      </div>

                      <div className="subject-progress-item">

                        <div className="subject-progress-top">

                          <span>
                            FSJP
                          </span>

                          <strong>
                            78%
                          </strong>

                        </div>

                        <div className="subject-progress-bar">

                          <div
                            className="subject-progress-fill"
                            style={{
                              width: "78%"
                            }}
                          ></div>

                        </div>

                      </div>

                    </div>

                  </div>

                  <div className="progress-info-note">

                    <span>ⓘ</span>

                    <p>
                      Progress information is managed
                      by faculty. Students can view their
                      academic progress but cannot
                      modify these values.
                    </p>

                  </div>

                </div>

              </Page>
            )
          }

          {/* RESOURCES */}

          {
            activeTab === "Resources" && (

              <Page title="Resources">

                <div className="resources-page">

                  {!resourceBranch &&
                    !resourceSubject && (

                      <>

                        <div className="resources-header">

                          <h2>
                            Study Resources
                          </h2>

                          <p>
                            Select your branch to
                            access subject-wise
                            resources.
                          </p>

                        </div>

                        <div className="resources-section-title">

                          <h3>
                            Select Branch
                          </h3>

                        </div>

                        <div className="branch-resource-grid">

                          <button
                            className="branch-resource-card"
                            onClick={() =>
                              setResourceBranch(
                                "Information Technology"
                              )
                            }
                          >

                            <span className="branch-icon">
                              💻
                            </span>

                            <div>

                              <h3>
                                Information Technology
                              </h3>

                              <p>
                                IT Department
                              </p>

                            </div>

                            <span className="resource-arrow">
                              →
                            </span>

                          </button>

                          <button
                            className="branch-resource-card"
                            onClick={() =>
                              setResourceBranch(
                                "Computer Engineering"
                              )
                            }
                          >

                            <span className="branch-icon">
                              🖥️
                            </span>

                            <div>

                              <h3>
                                Computer Engineering
                              </h3>

                              <p>
                                Computer Department
                              </p>

                            </div>

                            <span className="resource-arrow">
                              →
                            </span>

                          </button>

                          <button
                            className="branch-resource-card"
                            onClick={() =>
                              setResourceBranch(
                                "Artificial Intelligence & Data Science"
                              )
                            }
                          >

                            <span className="branch-icon">
                              🤖
                            </span>

                            <div>

                              <h3>
                                Artificial Intelligence
                                & Data Science
                              </h3>

                              <p>
                                AI & DS Department
                              </p>

                            </div>

                            <span className="resource-arrow">
                              →
                            </span>

                          </button>

                          <button
                            className="branch-resource-card"
                            onClick={() =>
                              setResourceBranch(
                                "Electronics & Telecommunication"
                              )
                            }
                          >

                            <span className="branch-icon">
                              📡
                            </span>

                            <div>

                              <h3>
                                Electronics &
                                Telecommunication
                              </h3>

                              <p>
                                EXTC Department
                              </p>

                            </div>

                            <span className="resource-arrow">
                              →
                            </span>

                          </button>

                          <button
                            className="branch-resource-card"
                            onClick={() =>
                              setResourceBranch(
                                "Mechanical Engineering"
                              )
                            }
                          >

                            <span className="branch-icon">
                              ⚙️
                            </span>

                            <div>

                              <h3>
                                Mechanical Engineering
                              </h3>

                              <p>
                                Mechanical Department
                              </p>

                            </div>

                            <span className="resource-arrow">
                              →
                            </span>

                          </button>

                        </div>

                      </>

                    )}

                  {resourceBranch && !resourceSubject && (
                    <>
                      <button
                        className="resource-back-btn"
                        onClick={() => setResourceBranch(null)}
                      >
                        ← Back to Resources
                      </button>

                      <div className="resources-header">
                        <h2>{profileBranch} Resources</h2>
                        <p>
                          Select a subject to view resources shared by faculty.
                        </p>
                      </div>

                      <div className="resource-subject-grid">

                        {profileBranch === "Information Technology" ? (
                          <>
                            {["ADSA", "Java", "DBMS", "FSJP", "ED"].map((subject) => (
                              <button
                                key={subject}
                                className="resource-subject-card"
                                onClick={() => setResourceSubject(subject)}
                              >
                                <span className="resource-subject-icon">
                                  📚
                                </span>

                                <div>
                                  <h3>{subject}</h3>
                                  <p>
                                    View {subject} resources
                                  </p>
                                </div>

                                <span className="resource-arrow">
                                  →
                                </span>
                              </button>
                            ))}
                          </>
                        ) : (
                          <div className="no-resources-message">
                            <span>📚</span>
                            <h3>Subjects will be added soon</h3>
                            <p>
                              Resources for {profileBranch} will be available soon.
                            </p>
                          </div>
                        )}

                      </div>
                    </>
                  )}

                  {resourceBranch &&
                    resourceSubject && (

                      <>

                        <button
                          className="resource-back-btn"
                          onClick={() =>
                            setResourceSubject(null)
                          }
                        >
                          ← Back to {resourceBranch}
                        </button>

                        <div className="resources-header">

                          <h2>
                            {resourceSubject} Resources
                          </h2>

                          <p>
                            {resourceBranch} •
                            Resources uploaded
                            by faculty
                          </p>

                        </div>

                        {role === "Faculty" && (

                          <div className="faculty-resource-upload-card">

                            <div>

                              <h3>
                                Upload Resource
                              </h3>

                              <p>
                                Upload notes, PDFs,
                                images, documents or
                                other study material.
                              </p>

                            </div>

                            <label className="upload-resource-btn">

                              ⬆ Upload Resource

                              <input
                                type="file"
                                multiple
                                style={{
                                  display: "none"
                                }}
                                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.ppt,.pptx,.txt"
                              />

                            </label>

                          </div>

                        )}

                        <div className="resource-files-section">

                          <div className="resource-files-title">

                            <div>

                              <h3>
                                Available Resources
                              </h3>

                              <p>
                                Files and links shared
                                by faculty.
                              </p>

                            </div>

                          </div>

                          <div className="resource-files-list">

                            <div className="resource-file-card">

                              <div className="file-type-icon pdf-icon">
                                PDF
                              </div>

                              <div className="resource-file-details">

                                <h4>
                                  {resourceSubject}
                                  {" "}Unit 1 Notes
                                </h4>

                                <p>
                                  Uploaded by Faculty •
                                  PDF
                                </p>

                              </div>

                              <button className="resource-action-btn">
                                📖 Read
                              </button>

                            </div>

                            <div className="resource-files-list">

                              {resources.filter((resource) =>
                                resource.branch === profileBranch &&
                                resource.division === profileDivision &&
                                resource.subject === resourceSubject
                              ).length === 0 ? (

                                <div className="no-resources-message">

                                  <span>📚</span>

                                  <h3>No resources available</h3>

                                  <p>
                                    Faculty has not shared any resources for
                                    Division {profileDivision} in {resourceSubject} yet.
                                  </p>

                                </div>

                              ) : (

                                resources.filter((resource) =>
                                  resource.branch === profileBranch &&
                                  resource.division === profileDivision &&
                                  resource.subject === resourceSubject
                                )
                                  .map((resource) => (

                                    <div
                                      className="resource-file-card"
                                      key={resource.id}
                                    >

                                      <div
                                        className={
                                          resource.type === "PDF"
                                            ? "file-type-icon pdf-icon"
                                            : resource.type === "Link"
                                              ? "file-type-icon link-icon"
                                              : "file-type-icon image-icon"
                                        }
                                      >
                                        {resource.type === "Link"
                                          ? "🔗"
                                          : resource.type === "PDF"
                                            ? "PDF"
                                            : "FILE"}
                                      </div>

                                      <div className="resource-file-details">

                                        <h4>
                                          {resource.title}
                                        </h4>

                                        <p>
                                          Shared by {resource.uploadedBy}
                                          {" • "}
                                          {resource.type}
                                        </p>

                                        {resource.description && (
                                          <small>
                                            {resource.description}
                                          </small>
                                        )}

                                      </div>

                                      <button
                                        className="resource-action-btn"
                                        onClick={() => {

                                          if (resource.link) {

                                            window.open(
                                              resource.link,
                                              "_blank",
                                              "noopener,noreferrer"
                                            );

                                          } else if (resource.fileData) {

                                            const newWindow =
                                              window.open();

                                            if (newWindow) {
                                              newWindow.location.href =
                                                resource.fileData;
                                            }

                                          } else {

                                            alert(
                                              "This resource cannot be opened."
                                            );

                                          }

                                        }}
                                      >
                                        {resource.link
                                          ? "🔗 Open"
                                          : "📖 View"}
                                      </button>

                                    </div>

                                  ))

                              )}

                            </div>

                            <div className="resource-file-card">

                              <div className="file-type-icon link-icon">
                                🔗
                              </div>

                              <div className="resource-file-details">

                                <h4>
                                  Useful Learning Link
                                </h4>

                                <p>
                                  Shared by Faculty •
                                  External Link
                                </p>

                              </div>

                              <button className="resource-action-btn">
                                Open
                              </button>

                            </div>

                          </div>

                        </div>

                      </>

                    )}

                </div>

              </Page>
            )
          }

          {/* SETTINGS */}

          {
            activeTab === "Settings" && (

              <Page title="Settings">

                <div className="settings-page">

                  <div className="settings-card">

                    <div className="settings-card-header">

                      <div>

                        <h2>
                          Profile Information
                        </h2>

                        <p>
                          Update your personal and academic details.
                        </p>

                      </div>

                    </div>

                    <div className="settings-form">

                      {/* Full Name */}

                      <div className="settings-field">

                        <label>
                          Full Name
                        </label>

                        <input
                          type="text"
                          value={draftProfileName}
                          onChange={(e) => {
                            setDraftProfileName(e.target.value);
                            setProfileSaved(false);
                          }}
                          placeholder="Enter your name"
                        />

                      </div>


                      {/* Branch */}

                      <div className="settings-field">

                        <label>
                          Branch
                        </label>

                        <select
                          value={draftProfileBranch}
                          onChange={(e) => {
                            setDraftProfileBranch(e.target.value);
                            setProfileSaved(false);
                          }}
                        >

                          <option value="Information Technology">
                            Information Technology
                          </option>

                          <option value="Computer Engineering">
                            Computer Engineering
                          </option>

                          <option value="Artificial Intelligence & Data Science">
                            Artificial Intelligence & Data Science
                          </option>

                          <option value="Electronics & Telecommunication">
                            Electronics & Telecommunication
                          </option>

                          <option value="Mechanical Engineering">
                            Mechanical Engineering
                          </option>

                        </select>

                      </div>


                      {/* Division */}

                      <div className="settings-field">

                        <label>
                          Division
                        </label>

                        <select
                          value={draftProfileDivision}
                          onChange={(e) => {
                            setDraftProfileDivision(e.target.value);
                            setProfileSaved(false);
                          }}
                        >

                          <option value="A">A</option>
                          <option value="B">B</option>
                          <option value="C">C</option>
                          <option value="D">D</option>

                        </select>

                      </div>


                      {/* Save */}

                      <button
                        className="settings-save-btn"
                        onClick={() => {

                          const updatedProfile = {
                            name: draftProfileName.trim(),
                            branch: draftProfileBranch,
                            division: draftProfileDivision
                          };

                          setProfileName(updatedProfile.name);
                          setProfileBranch(updatedProfile.branch);
                          setProfileDivision(updatedProfile.division);

                          const accountKey =
                            `smartBuddyProfile_${role}_${userId}`;

                          localStorage.setItem(
                            accountKey,
                            JSON.stringify(updatedProfile)
                          );

                          setProfileSaved(true);

                        }}
                      >
                        Save Changes
                      </button>


                      {profileSaved && (

                        <div className="settings-success">
                          ✓ Profile information saved successfully.
                        </div>

                      )}

                    </div>

                  </div>


                  {/* Profile Preview */}

                  <div className="settings-preview">

                    <div className="settings-preview-icon">
                      {draftProfileName
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div>

                      <h3>
                        {draftProfileName || "Student Name"}
                      </h3>

                      <p>
                        {draftProfileBranch}
                      </p>

                      <span>
                        Division {draftProfileDivision}
                      </span>

                    </div>

                  </div>


                  {/* Logout */}

                  <button
                    className="settings-logout-btn"
                    onClick={logout}
                  >
                    Logout
                  </button>

                </div>

              </Page>
            )
          }

        </section>

        <footer className="footer">
          <b>
            Smart Buddy
          </b>{" "}
          | Your Academic Companion

          <span>
            Together Towards a Brighter Tomorrow 🌱
          </span>
        </footer>

      </main>

    </>
  );
}

function Page({ title, children }) {
  return (
    <>
      <div className="page-title">
        <h1>{title}</h1>
      </div>

      {children}
    </>
  );
}

export default App;