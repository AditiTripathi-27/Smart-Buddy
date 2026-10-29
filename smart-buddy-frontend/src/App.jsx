const API_URL = "/api";

import React, { useState, useEffect } from "react";
import "./App.css";

import {
  fetchRecentActivity,
  saveActivity,
  addTask as addTaskAPI,
  updateTask
} from "./api/apiService";

const initialTasks = [];

const ALLOWED_RESOURCE_EXTENSIONS = [
  "pdf", "doc", "docx", "ppt", "pptx",
  "jpg", "jpeg", "png"
];

const MAX_RESOURCE_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const BRANCH_OPTIONS = [
  "Information Technology",
  "Computer Engineering",
  "Artificial Intelligence and Data Science",
  "Electronics and Telecommunication",
  "Mechanical Engineering",
  "Civil Engineering"
];

const DIVISION_OPTIONS = ["A", "B", "C", "D"];

function App() {

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);


  const getAccountData = (key, fallback = []) => {
    try {
      return JSON.parse(
        localStorage.getItem(`${key}_${accountKey}`) ||
        JSON.stringify(fallback)
      );
    } catch {
      return fallback;
    }
  };
  const [loggedIn, setLoggedIn] = useState(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("smartBuddyCurrentUser");

    return Boolean(token && savedUser);
  });
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
  const [registerBranch, setRegisterBranch] = useState("");
  const [registerDivision, setRegisterDivision] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [registerSuccess, setRegisterSuccess] = useState("");

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [attendanceMessage, setAttendanceMessage] = useState("");



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
  const [resourceBranch, setResourceBranch] = useState(profileBranch);
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


  const [dueDateTitle, setDueDateTitle] = useState("");
  const [dueDateSubject, setDueDateSubject] = useState("");
  const [dueDateBranch, setDueDateBranch] = useState("");
  const [dueDateDivision, setDueDateDivision] = useState("A");
  const [dueDateValue, setDueDateValue] = useState("");
  const [dueDates, setDueDates] = useState([]);
  const [dueDateLoading, setDueDateLoading] = useState(false);


  useEffect(() => {
    if (!toast.show) return;

    const timer = setTimeout(() => {
      setToast({
        show: false,
        message: "",
        type: "success"
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [toast.show]);

  useEffect(() => {
    let cancelled = false;

    const clearSession = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("smartBuddyCurrentUser");
      setLoggedIn(false);
      setUserId("");
      setPassword("");
    };

    const restoreSession = async () => {
      const token = localStorage.getItem("token");
      const savedUser = localStorage.getItem("smartBuddyCurrentUser");

      if (!token || !savedUser) {
        if (!cancelled) setLoggedIn(false);
        return;
      }

      try {
        const user = JSON.parse(savedUser);

        if (!user.email || !user.role) {
          clearSession();
          return;
        }

        // Restore the saved profile
        const accountKey =
          `smartBuddyProfile_${user.role}_${user.email}`;

        const savedProfile = localStorage.getItem(accountKey);
        const profile = savedProfile
          ? JSON.parse(savedProfile)
          : {};

        setRole(user.role);
        setUserId(user.email);

        setProfileName(profile.name || user.name || "");
        setProfileBranch(
          profile.branch || user.branch || "Information Technology"
        );
        setProfileDivision(profile.division || user.division || "A");

        setDraftProfileName(profile.name || user.name || "");
        setDraftProfileBranch(
          profile.branch || user.branch || "Information Technology"
        );
        setDraftProfileDivision(
          profile.division || user.division || "A"
        );

        // Verify the saved token with the backend
        const response = await fetch(
          `${API_URL}/session/validate`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (cancelled) return;

        if (response.status === 401 || response.status === 403) {
          clearSession();
          return;
        }

        if (!response.ok) {
          console.error(
            "Session verification unavailable:",
            response.status
          );
          return;
        }

        const result = await response.json();

        if (result.valid !== true) {
          clearSession();
          return;
        }

        setLoggedIn(true);
      } catch (error) {
        if (cancelled) return;

        if (error instanceof SyntaxError) {
          clearSession();
        } else {
          // Network/server error: don't erase the saved session
          console.error("Session verification failed:", error);
        }
      }
    };

    restoreSession();

    return () => {
      cancelled = true;
    };
  }, []);


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

  const [noteSuccess, setNoteSuccess] = useState("");

  const currentAccount = JSON.parse(
    localStorage.getItem("smartBuddyCurrentUser") || "null"
  );

  const accountKey = currentAccount?.email
    ? currentAccount.email.toLowerCase()
    : "guest";

  const [tasks, setTasks] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem(`smartBuddyTasks_${accountKey}`) || "[]"
      );
    } catch {
      return [];
    }
  });

  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    localStorage.setItem(
      `smartBuddyTasks_${accountKey}`,
      JSON.stringify(tasks)
    );
  }, [tasks, accountKey]);


  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    setDashboardData(null);

    try {
      const savedActivity = JSON.parse(
        localStorage.getItem(`smartBuddyActivity_${accountKey}`) || "[]"
      );

      setRecentActivity(savedActivity);
    } catch (error) {
      setRecentActivity([]);
    }
  }, [accountKey]);



  const [newTask, setNewTask] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newSubject, setNewSubject] = useState("");

  const [notes, setNotes] = useState([
    "DBMS important questions",
    "CN experiment 6 notes",
    "Java practical preparation",
  ]);





  const addLocalActivity = async (description) => {
    try {
      await saveActivity(description);

      const activities = await fetchRecentActivity();
      setRecentActivity(activities);
    } catch (error) {
      console.error("Could not save activity to database:", error);
      showToast("Activity could not be saved to database.", "error");
    }
  };



  const addTask = async () => {
    if (!newTask.trim() || !newDate) {
      showToast("Please enter task title and due date.", "error");
      return;
    }

    const selectedDate = new Date(newDate);
    const now = new Date();

    if (Number.isNaN(selectedDate.getTime())) {
      showToast("Please select a valid due date and time.", "error");
      return;
    }

    if (selectedDate <= now) {
      showToast("Due date and time must be in the future.", "error");
      return;
    }

    const taskData = {
      title: newTask.trim(),
      dueDate: newDate,
      subject: newSubject.trim() || "General",
      status: "Pending"
    };

    try {
      const savedTask = await addTaskAPI(taskData);

      setTasks((prevTasks) => [
        ...prevTasks,
        {
          ...savedTask,
          due: savedTask.dueDate
        }
      ]);

      setNewTask("");
      setNewDate("");
      setNewSubject("");

      addLocalActivity(`Task added: ${savedTask.title || taskData.title}`);

      showToast("Task added successfully!", "success");
    } catch (error) {
      console.error("Task save failed:", error);
      showToast("Task could not be saved. Please try again.", "error");
    }
  };



  const [newNote, setNewNote] = useState("");

  const [mySpaceText, setMySpaceText] = useState("");

  const [mySpaceNotes, setMySpaceNotes] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem(`smartBuddyMySpace_${accountKey}`) || "[]"
      );
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(
      `smartBuddyMySpace_${accountKey}`,
      JSON.stringify(mySpaceNotes)
    );
  }, [mySpaceNotes, accountKey]);

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


  const [studentAttendanceSheets, setStudentAttendanceSheets] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceLoadError, setAttendanceLoadError] = useState("");


  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedDivision, setSelectedDivision] = useState("");
  const [attendanceType, setAttendanceType] = useState("");


  const uploadAttendanceSheet = async () => {
    if (!attendanceFile) {
      alert("Please select an attendance sheet first.");
      return;
    }

    if (!selectedSubject || !selectedDivision || !attendanceType) {
      alert("Please select the subject, division and attendance type.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Your login session has expired. Please log in again.");
      return;
    }

    let currentUser;

    try {
      currentUser = JSON.parse(
        localStorage.getItem("smartBuddyCurrentUser") || "{}"
      );
    } catch {
      alert("Could not read your account. Please log in again.");
      return;
    }

    const branch = currentUser.branch;

    if (!branch) {
      alert("Your account has no branch assigned. Please check your account.");
      return;
    }

    const fileName = attendanceFile.name.toLowerCase();

    if (
      !fileName.endsWith(".csv") &&
      !fileName.endsWith(".xls") &&
      !fileName.endsWith(".xlsx")
    ) {
      alert("Please upload an Excel (.xls, .xlsx), or CSV file.");
      return;
    }

    const formData = new FormData();
    formData.append("subject", selectedSubject);
    formData.append("branch", branch);
    formData.append("division", selectedDivision);
    formData.append("attendanceType", attendanceType);
    formData.append("file", attendanceFile);

    try {
      const response = await fetch(
        `${API_URL}/attendance-sheets`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: formData
        }
      );

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || `Upload failed (${response.status})`);
      }

      setToast({
        show: true,
        message: "Attendance shared successfully!",
        type: "success"
      });
      setAttendanceUploaded(true);
      setAttendanceUpdatedAt(new Date().toLocaleString());
      setAttendanceFile(null);
    } catch (error) {
      console.error("Attendance upload failed:", error);
      alert(error.message || "Upload failed. Check that the backend is running.");
    }
  };


  useEffect(() => {
    if (activeTab !== "Attendance" || role !== "Student") {
      return;
    }

    let cancelled = false;

    const loadAttendance = async () => {
      setAttendanceLoading(true);
      setAttendanceLoadError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setAttendanceLoadError("Please log in again to view attendance.");
        setAttendanceLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/attendance-sheets`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Unable to load attendance. Please try again.");
        }

        const data = await response.json();

        if (!cancelled) {
          setStudentAttendanceSheets(
            Array.isArray(data) ? data : []
          );
        }
      } catch (error) {
        if (!cancelled) {
          setAttendanceLoadError(error.message);
        }
      } finally {
        if (!cancelled) {
          setAttendanceLoading(false);
        }
      }
    };

    loadAttendance();

    return () => {
      cancelled = true;
    };
  }, [activeTab, role]);



  const login = async (e) => {
    e.preventDefault();



    if (!userId.trim() || !password.trim()) {
      setLoginError("Please enter User ID and Password.");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/auth/login`,
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
        console.error("Login status:", response.status);
        console.error("Login response:", data);

        setLoginError(
          typeof data === "string"
            ? data
            : data?.message || `Login failed: ${response.status}`
        );

        return;
      }
      /* Save login information */
      localStorage.setItem("token", data.token);

      localStorage.setItem(
        "smartBuddyCurrentUser",
        JSON.stringify(data)
      );

      const newAccountKey = (data.email || userId).toLowerCase();

      try {
        setTasks(
          JSON.parse(
            localStorage.getItem(`smartBuddyTasks_${newAccountKey}`) || "[]"
          )
        );
      } catch {
        setTasks([]);
      }

      try {
        setMySpaceNotes(
          JSON.parse(
            localStorage.getItem(`smartBuddyMySpace_${newAccountKey}`) || "[]"
          )
        );
      } catch {
        setMySpaceNotes([]);
      }

      // Reset previous account's dashboard data
      setDashboardData(null);
      setRecentActivity([]);
      setDueDates([]);
      setActiveTab("Dashboard");


      setNewTask("");
      setNewDate("");
      setNewSubject("");

      setMySpaceText("");
      setNotes([]);

      setToast({
        show: false,
        message: "",
        type: "success"
      });

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

        setProfileDivision(data.division || "A");
        setDraftProfileDivision(data.division || "A");

        setDraftProfileName(data.name || "");

        setDraftProfileBranch(
          data.branch ||
          "Information Technology"
        );


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

  const loadResources = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/resources/all`,
        {
          headers: token
            ? { Authorization: `Bearer ${token}` }
            : {}
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load resources");
      }

      const data = await response.json();
      setResources(data);
    } catch (error) {
      console.error("Loading resources failed:", error);
    }
  };

  useEffect(() => {
    if (loggedIn) {
      loadResources();
    }
  }, [loggedIn]);


  useEffect(() => {
    if (
      !loggedIn ||
      role !== "Student" ||
      !profileBranch ||
      !profileDivision
    ) {
      setDueDates([]);
      return;
    }

    const controller = new AbortController();

    const fetchDueDates = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(
          `${API_URL}/due-dates?branch=${encodeURIComponent(
            profileBranch
          )}&division=${encodeURIComponent(profileDivision)}`,
          {
            headers: token
              ? { Authorization: `Bearer ${token}` }
              : {},
            signal: controller.signal
          }
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch deadlines: ${response.status}`
          );
        }

        const data = await response.json();
        setDueDates(Array.isArray(data) ? data : []);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Fetching due dates failed:", error);
        }
      }
    };

    fetchDueDates();

    return () => controller.abort();
  }, [loggedIn, role, profileBranch, profileDivision]);


  const saveDueDate = async () => {
    if (
      !dueDateTitle.trim() ||
      !dueDateSubject ||
      !dueDateBranch ||
      !dueDateDivision ||
      !dueDateValue
    ) {
      showToast("Please fill in all due date details.", "error");
      return;
    }

    try {
      setDueDateLoading(true);

      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/due-dates`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          title: dueDateTitle.trim(),
          subject: dueDateSubject,
          branch: dueDateBranch,
          division: dueDateDivision,
          dueDate: dueDateValue,
          createdBy: profileName
        })
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Could not save due date.");
      }

      showToast("Due date added successfully!", "success");

      setDueDateTitle("");
      setDueDateSubject("");
      setDueDateBranch("");
      setDueDateDivision("A");
      setDueDateValue("");

    } catch (error) {
      console.error("Save due date failed:", error);
      showToast(error.message || "Could not save due date.", "error");
    } finally {
      setDueDateLoading(false);
    }
  };


  const shareResource = async () => {
    if (!resourceTitle.trim()) {
      showToast("Please enter resource title.", "error");
      return;
    }

    if (resourceBranches.length === 0) {
      showToast("Please select at least one branch.", "error");
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

    if (
      resourceFile &&
      resourceFile.size > 10 * 1024 * 1024
    ) {
      showToast("File size must be 10 MB or less.", "error");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      for (const branch of resourceBranches) {
        let response;

        if (resourceFile) {
          // Upload actual file using FormData
          const formData = new FormData();

          formData.append("file", resourceFile);
          formData.append("title", resourceTitle.trim());
          formData.append("subject", resourceSubject);
          formData.append("branch", branch);
          formData.append("division", resourceDivision);
          formData.append("resourceType", resourceType);
          formData.append("uploadedBy", profileName);

          response = await fetch(
            `${API_URL}/resources/upload`,
            {
              method: "POST",
              headers: token
                ? { Authorization: `Bearer ${token}` }
                : {},
              body: formData
            }
          );
        } else {
          // Share external link
          response = await fetch(`${API_URL}/resources`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token
                ? { Authorization: `Bearer ${token}` }
                : {})
            },
            body: JSON.stringify({
              title: resourceTitle.trim(),
              subject: resourceSubject,
              branch,
              division: resourceDivision,
              resourceType,
              resourceUrl: resourceLink.trim(),
              uploadedBy: profileName
            })
          });
        }

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || "Resource upload failed");
        }
      }

      showToast(
        resourceFile
          ? "File uploaded successfully!"
          : "Resource shared successfully!",
        "success"
      );

      clearResourceForm();
      await loadResources();

    } catch (error) {
      console.error("Resource save failed:", error);
      showToast(
        error.message || "Resource could not be saved.",
        "error"
      );
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
      !registerBranch.trim() ||
      (role === "Student" && !registerDivision.trim())
    ) {
      setRegisterError("Please fill in all fields.");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/auth/register`,
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
            branch: registerBranch.trim(),
            division: role === "Student" ? registerDivision : null
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
      setRegisterDivision("A");

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
    localStorage.removeItem("token");
    localStorage.removeItem("smartBuddyCurrentUser");

    setLoggedIn(false);
    setUserId("");
    setPassword("");
    setActiveTab("Dashboard");
  };

  const toggleTask = async (id) => {
    const task = tasks.find((item) => item.id === id);

    if (!task) return;

    const updatedStatus =
      task.status === "Completed" ? "Pending" : "Completed";

    const updatedTask = {
      title: task.title,
      subject: task.subject || "General",
      dueDate: task.dueDate || task.due,
      status: updatedStatus
    };

    try {
      const savedTask = await updateTask(id, updatedTask);

      setTasks((oldTasks) =>
        oldTasks.map((item) =>
          item.id === id
            ? { ...item, ...savedTask, due: savedTask.dueDate }
            : item
        )
      );

      showToast("Task status updated!", "success");

      addLocalActivity(
        `${updatedStatus === "Completed" ? "Task completed" : "Task reopened"}: ${task.title}`
      );

    } catch (error) {
      console.error("Task update failed:", error);
      showToast("Could not update task. Please try again.", "error");
    }
  };


  const addNote = () => {
    if (!newNote.trim()) return;

    setNotes([...notes, newNote]);
    setNewNote("");
  };


  const filteredTasks = tasks;


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
              Notes, tasks list, timetable and resources —
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
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
                <div className="login-options">





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

                <select
                  value={registerBranch}
                  onChange={(e) => setRegisterBranch(e.target.value)}
                  required
                >
                  <option value="">Select Branch</option>
                  {BRANCH_OPTIONS.map((branch) => (
                    <option key={branch} value={branch}>
                      {branch}
                    </option>
                  ))}
                </select>

                {role === "Student" && (
                  <>
                    <label>Division</label>
                    <select
                      value={registerDivision}
                      onChange={(e) => setRegisterDivision(e.target.value)}
                      required
                    >
                      <option value="">Select Division</option>
                      {DIVISION_OPTIONS.map((division) => (
                        <option key={division} value={division}>
                          Division {division}
                        </option>
                      ))}
                    </select>
                  </>
                )}


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
              ["Send Time Table", "🕒"],


              ["Due Dates", "📅"],
              ["Calendar", "▦"],
              ["Settings", "⚙"],

            ]
            : [
              ["Dashboard", "⌂"],
              ["My Tasks", "▣"],
              ["Calendar", "▦"],
              ["Timetable", "▤"],

              ["Attendance", "▥"],

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

          <div className="top-right">

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



            </div>

          </div>

        </header>


        {/* CONTENT */}


        <section
          className="content"
          ref={(element) => {
            if (element) {
              element.scrollTop = 0;
            }
          }}
        >


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
                      setActiveTab("Send Time Table")
                    }
                  >
                    <span>🕒 </span>

                    <div>
                      <h3>Send Time Table</h3>
                      <p>
                        Send Time Table
                        to students.
                      </p>
                    </div>

                    <b>→</b>
                  </button>





                  <button
                    className="faculty-action-card"
                    onClick={() => setActiveTab("Due Dates")}
                  >
                    <span>📅</span>

                    <div>
                      <h3>Due Dates & Submissions</h3>
                      <p>
                        Add assignment deadlines for a specific
                        branch, division and subject.
                      </p>
                    </div>

                    <b>→</b>
                  </button>






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


                  </div>

                  <div className="dashboard-grid">

                    <div className="panel task-panel">

                      <div className="panel-heading">

                        <h2>
                          ▣ My Tasks
                        </h2>

                        <button
                          onClick={() =>
                            setActiveTab("My Tasks")
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
                            <b>{task.title}</b>
                            <span>
                              Due: {task.due.includes("T")
                                ? `${task.due.split("T")[0]} (${task.due.split("T")[1]})`
                                : task.due}
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
                            className="delete-task-btn"
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
                        <h2>◷ Recent Activity</h2>
                      </div>

                      {recentActivity && recentActivity.length > 0 ? (
                        recentActivity.map((activity, index) => (
                          <div className="activity" key={activity.id || index}>
                            <span className="dot green-dot"></span>
                            <div>
                              <b>{activity.description || activity.message || activity.title}</b>

                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="no-activity">
                          No recent activity yet.
                        </p>
                      )}
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

          {/* My Tasks */}

          {
            activeTab === "My Tasks" && (

              <Page title="Tasks">

                <div className="full-panel">

                  <h2>Tasks</h2>

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

                  <div className="add-task">

                    <input
                      placeholder="Enter task title..."
                      value={newTask}
                      onChange={(e) => setNewTask(e.target.value)}
                    />


                    <input
                      type="datetime-local"
                      value={newDate}
                      min={(() => {
                        const now = new Date();
                        now.setMinutes(
                          now.getMinutes() - now.getTimezoneOffset()
                        );
                        return now.toISOString().slice(0, 16);
                      })()}
                      onChange={(e) => setNewDate(e.target.value)}
                      required
                    />

                    <button onClick={addTask}>
                      Add Task
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


                        const dateKey = [
                          date.getFullYear(),
                          String(date.getMonth() + 1).padStart(2, "0"),
                          String(date.getDate()).padStart(2, "0")
                        ].join("-");

                        const today = new Date();
                        today.setHours(0, 0, 0, 0);

                        const deadlinesForDay = dueDates.filter((item) => {
                          const dueDate = new Date(item.dueDate + "T00:00:00");
                          return item.dueDate === dateKey && dueDate >= today;
                        });


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


                            {deadlinesForDay.length > 0 && (
                              <small className="calendar-deadline-badge">
                                📌 {deadlinesForDay.length} due
                              </small>
                            )}



                          </button>
                        );
                      }
                    )}


                    {selectedCalendarDate && (
                      <div className="calendar-deadline-details">
                        <h3>
                          Deadlines for{" "}
                          {selectedCalendarDate.toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "long",
                            year: "numeric"
                          })}
                        </h3>

                        {dueDates.filter((item) => {
                          const selectedKey = [
                            selectedCalendarDate.getFullYear(),
                            String(selectedCalendarDate.getMonth() + 1).padStart(2, "0"),
                            String(selectedCalendarDate.getDate()).padStart(2, "0")
                          ].join("-");

                          return item.dueDate === selectedKey;

                          const today = new Date();
                          today.setHours(0, 0, 0, 0);

                          const dueDate = new Date(item.dueDate + "T00:00:00");

                          return item.dueDate === selectedKey && dueDate >= today;
                        }).length > 0 ? (
                          dueDates
                            .filter((item) => {
                              const selectedKey = [
                                selectedCalendarDate.getFullYear(),
                                String(selectedCalendarDate.getMonth() + 1).padStart(2, "0"),
                                String(selectedCalendarDate.getDate()).padStart(2, "0")
                              ].join("-");

                              return item.dueDate === selectedKey;

                              const today = new Date();
                              today.setHours(0, 0, 0, 0);

                              const dueDate = new Date(item.dueDate + "T00:00:00");

                              return item.dueDate === selectedKey && dueDate >= today;
                            })
                            .map((item) => (
                              <div
                                className="calendar-deadline-item"
                                key={item.id}
                              >
                                <span>📘</span>
                                <div>
                                  <strong>{item.title}</strong>
                                  <p>{item.subject}</p>
                                </div>
                              </div>
                            ))
                        ) : (
                          <p>No deadlines for this date.</p>
                        )}
                      </div>
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

                            setNoteSuccess("Note saved successfully!");
                            setTimeout(() => {
                              setNoteSuccess("");
                            }, 3000);
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

                            setNoteSuccess("Note deleted successfully!");
                            setTimeout(() => {
                              setNoteSuccess("");
                            }, 3000);
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



                    <button
                      className="timetable-download-btn"
                      onClick={async () => {
                        try {
                          const response = await fetch("/api/timetables", {
                            headers: {
                              Authorization: `Bearer ${localStorage.getItem("token")}`
                            }
                          });

                          if (!response.ok) {
                            throw new Error("Could not fetch timetable.");
                          }

                          const timetables = await response.json();

                          if (!timetables.length) {
                            alert("No timetable available for your branch and division.");
                            return;
                          }

                          const timetable = timetables[0];

                          const downloadResponse = await fetch(
                            `/api/timetables/${timetable.id}/download`,
                            {
                              headers: {
                                Authorization: `Bearer ${localStorage.getItem("token")}`
                              }
                            }
                          );

                          if (!downloadResponse.ok) {
                            throw new Error("Could not download timetable.");
                          }

                          const blob = await downloadResponse.blob();
                          const url = URL.createObjectURL(blob);
                          const link = document.createElement("a");

                          link.href = url;
                          link.download = timetable.fileName || "Timetable";
                          document.body.appendChild(link);
                          link.click();
                          link.remove();
                          URL.revokeObjectURL(url);
                        } catch (error) {
                          alert(error.message || "Download failed.");
                        }
                      }}
                    >
                      ⬇ Download Timetable
                    </button>

                  </div>



                  <div className="timetable-note">

                    <span>ⓘ</span>

                    <p>
                      Timetable is provided and
                      updated only by the faculty.
                    </p>

                  </div>

                </div>

              </Page>
            )
          }




          {/* STUDENT ATTENDANCE */}
          {activeTab === "Attendance" && role === "Student" && (
            <Page title="Attendance">
              <div className="full-panel attendance-page">
                <div className="attendance-header">
                  <div>
                    <h2>Attendance Overview</h2>
                    <p>View attendance sheets shared by your faculty.</p>
                  </div>
                  <div className="attendance-readonly">🔒 Read Only</div>
                </div>

                {attendanceLoading && <p>Loading attendance sheets...</p>}

                {attendanceLoadError && (
                  <p role="alert">{attendanceLoadError}</p>
                )}

                {!attendanceLoading &&
                  !attendanceLoadError &&
                  studentAttendanceSheets.length === 0 && (
                    <div className="attendance-note">
                      <span>ⓘ</span>
                      <p>
                        No attendance sheet shared yet. Your faculty's uploaded
                        sheet will appear here.
                      </p>
                    </div>
                  )}


                {studentAttendanceSheets.map((sheet) => (
                  <div
                    className="latest-attendance-card"
                    key={sheet.id}
                    style={{ marginTop: "20px" }}
                  >
                    <div>
                      <h3>{sheet.subject}</h3>
                      <p>
                        {sheet.attendanceType} • Division {sheet.division}
                      </p>
                      <p>{sheet.fileName}</p>
                      {sheet.uploadedAt && (
                        <span>
                          Uploaded: {new Date(sheet.uploadedAt).toLocaleString()}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      className="attendance-view-btn"
                      onClick={async () => {
                        try {
                          const token = localStorage.getItem("token");
                          const response = await fetch(
                            `${API_URL}/attendance-sheets/${sheet.id}/download`,
                            {
                              headers: {
                                Authorization: `Bearer ${token}`,
                              },
                            }
                          );

                          if (!response.ok) {
                            throw new Error("Unable to download attendance sheet.");
                          }

                          const fileBlob = await response.blob();
                          const fileUrl = URL.createObjectURL(fileBlob);
                          const link = document.createElement("a");
                          link.href = fileUrl;
                          link.download = sheet.fileName || "attendance";
                          document.body.appendChild(link);
                          link.click();
                          link.remove();
                          URL.revokeObjectURL(fileUrl);
                        } catch (error) {
                          alert(error.message);
                        }
                      }}
                    >
                      Download Sheet
                    </button>

                    <div className="attendance-table-wrapper">
                      <table className="attendance-table">
                        <thead>
                          <tr>
                            {(sheet.headers || []).map((header, index) => (
                              <th key={index}>{header}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {(sheet.rows || []).map((row, rowIndex) => (
                            <tr key={rowIndex}>
                              {(sheet.headers || []).map((header, columnIndex) => (
                                <td key={columnIndex}>
                                  {row[columnIndex] ?? ""}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}

                <div className="attendance-note">
                  <span>ⓘ</span>
                  <p>
                    Attendance is read-only for students. Only sheets uploaded
                    by faculty for your branch and division should appear here.
                  </p>
                </div>
              </div>
            </Page>
          )}


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
                      Faculty Upload
                    </div>

                  </div>

                  <div className="attendance-upload-form">

                    <div className="attendance-field">

                      <label>Subject</label>

                      <select
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                      >
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

                      <select
                        value={selectedDivision}
                        onChange={(e) => setSelectedDivision(e.target.value)}
                      >

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

                      <select
                        value={attendanceType}
                        onChange={(e) => setAttendanceType(e.target.value)}
                      >

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

                    <div className="attendance-file-info">
                      <h3>Upload Attendance Sheet</h3>
                      <p>
                        Upload the actual attendance sheet taken by the faculty.
                      </p>
                      <small>Supported formats: XLSX, XLS, CSV</small>
                    </div>

                    <div className="attendance-file-actions">
                      <label className="attendance-choose-file">
                        ⬆ Choose File
                        <input
                          type="file"
                          accept=".xlsx,.xls,.csv"
                          onChange={(e) => {
                            const selectedFile = e.target.files?.[0];

                            if (selectedFile) {
                              setAttendanceFile(selectedFile);
                              setAttendanceUploaded(false);
                              setAttendanceUpdatedAt("");
                            }
                          }}
                        />
                      </label>

                      <button
                        type="button"
                        className="attendance-submit-btn"
                        onClick={uploadAttendanceSheet}
                      >
                        Upload to Students
                      </button>
                    </div>
                  </div>


                  {attendanceFile && (
                    <div className="selected-attendance-file">
                      <div className="attendance-selected-icon">📄</div>

                      <div className="attendance-selected-info">
                        <strong>{attendanceFile.name}</strong>
                        <p>File selected and ready to share.</p>
                      </div>

                      <button
                        type="button"
                        className="attendance-delete-btn"
                        onClick={() => setShowDeleteConfirm(true)}
                      >
                        🗑 Delete
                      </button>
                    </div>
                  )}

                  {attendanceMessage && (
                    <div className="attendance-custom-message">
                      <span>✓</span>
                      <p>{attendanceMessage}</p>
                      <button
                        type="button"
                        onClick={() => setAttendanceMessage("")}
                        aria-label="Close message"
                      >
                        ×
                      </button>
                    </div>
                  )}

                  {showDeleteConfirm && (
                    <div className="attendance-modal-overlay">
                      <div className="attendance-confirm-modal">
                        <div className="attendance-modal-icon">🗑️</div>

                        <h3>Remove Selected File?</h3>

                        <p>
                          This file will be removed from your current selection.
                          Already shared attendance will remain available to students.
                        </p>

                        <div className="attendance-modal-actions">
                          <button
                            type="button"
                            className="attendance-cancel-btn"
                            onClick={() => setShowDeleteConfirm(false)}
                          >
                            Cancel
                          </button>

                          <button
                            type="button"
                            className="attendance-confirm-delete-btn"
                            onClick={() => {
                              setAttendanceFile(null);
                              setShowDeleteConfirm(false);
                              setAttendanceMessage("Selected file removed successfully.");
                            }}
                          >
                            Yes, Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

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
            activeTab === "Due Dates" && role === "Faculty" && (
              <Page title="Due Dates & Submissions">
                <div className="resources-page">


                  <div className="faculty-resource-upload-card">
                    <div className="resource-manager-grid">
                      <div>
                        <label>Branch</label>
                        <select
                          value={dueDateBranch}
                          onChange={(e) => setDueDateBranch(e.target.value)}
                        >
                          <option value="">Select Branch</option>
                          <option value="Information Technology">
                            Information Technology
                          </option>
                          <option value="Computer Engineering">
                            Computer Engineering
                          </option>
                          <option value="AI & DS">AI & DS</option>
                          <option value="EXTC">EXTC</option>
                          <option value="Mechanical">Mechanical</option>
                        </select>
                      </div>

                      <div>
                        <label>Division</label>
                        <select
                          value={dueDateDivision}
                          onChange={(e) => setDueDateDivision(e.target.value)}
                        >
                          <option value="A">Division A</option>
                          <option value="B">Division B</option>
                          <option value="C">Division C</option>
                          <option value="D">Division D</option>
                        </select>
                      </div>

                      <div>
                        <label>Subject</label>
                        <select
                          value={dueDateSubject}
                          onChange={(e) => setDueDateSubject(e.target.value)}
                        >
                          <option value="">Select Subject</option>
                          <option value="ADSA">ADSA</option>
                          <option value="Java">Java</option>
                          <option value="DBMS">DBMS</option>
                          <option value="FSJP">FSJP</option>
                          <option value="ED">ED</option>
                        </select>
                      </div>

                      <div>
                        <label>Assignment / Submission Heading</label>
                        <input
                          type="text"
                          placeholder="e.g. Java Assignment 1"
                          value={dueDateTitle}
                          onChange={(e) => setDueDateTitle(e.target.value)}
                        />
                      </div>

                      <div>
                        <label>Due Date</label>
                        <input
                          type="date"
                          value={dueDateValue}
                          min={new Date().toLocaleDateString("en-CA")}
                          onChange={(e) => setDueDateValue(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      className="resource-action-btn"
                      onClick={saveDueDate}
                      disabled={dueDateLoading}
                      style={{ marginTop: "20px" }}
                    >
                      {dueDateLoading ? "Saving..." : "📅 Add Due Date"}
                    </button>
                  </div>
                </div>
              </Page>
            )
          }


          {
            activeTab === "Manage Resources" && role === "Faculty" && (
              <Page title="Manage Resources">

                <div className="resources-page">


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
                        <label>Subject</label>

                        <select
                          value={resourceSubject || ""}
                          onChange={(e) => setResourceSubject(e.target.value)}
                        >
                          <option value="">Select Subject</option>
                          <option value="ADSA">ADSA</option>
                          <option value="Java">Java</option>
                          <option value="DBMS">DBMS</option>
                          <option value="FSJP">FSJP</option>
                          <option value="ED">ED</option>
                        </select>
                      </div>


                      <div>
                        <label>Branches</label>


                        <div className="branch-dropdown">
                          <details>
                            <summary>
                              <span>Branches</span>
                              <span className="branch-dropdown-arrow">⌄</span>
                            </summary>

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
                          </details>
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



          {
            activeTab === "Send Time Table" && role === "Faculty" && (
              <Page title="Send Time Table">
                <div className="resources-page">

                  <br /><br />

                  <label>Division</label>
                  <select id="tt-division" defaultValue="A">
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>

                  <br /><br />


                  <label className="timetable-file-label">
                    📁 Choose Timetable File
                  </label>

                  <div className="timetable-file-box">


                    <input
                      id="tt-file"
                      className="hidden-timetable-input"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.ppt,.pptx"

                    />
                  </div>




                  <br /><br />

                  <button
                    onClick={async () => {
                      const file = document.getElementById("tt-file").files[0];

                      if (!file) {
                        alert("Please select a timetable file.");
                        return;
                      }

                      if (file.size > 10 * 1024 * 1024) {
                        alert("File size must be under 10 MB.");
                        return;
                      }

                      const data = new FormData();
                      const currentUser = JSON.parse(
                        localStorage.getItem("smartBuddyCurrentUser") || "{}"
                      );

                      data.append(
                        "branch",
                        currentUser.branch || "Information Technology"
                      );
                      data.append("division", document.getElementById("tt-division").value);
                      data.append("file", file);

                      try {
                        const response = await fetch("/api/timetables", {
                          method: "POST",
                          headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`
                          },
                          body: data
                        });

                        if (!response.ok) {
                          throw new Error(await response.text() || "Upload failed");
                        }

                        console.log("Timetable upload successful");

                        showToast("Timetable shared successfully!");
                        document.getElementById("tt-file").value = "";
                      } catch (error) {
                        alert(error.message || "Upload failed.");
                      }
                    }}
                  >
                    📤 Upload Timetable
                  </button>
                </div>

              </Page>
            )
          }




          {/* RESOURCES */}

          {
            activeTab === "Resources" && (

              <Page title="Resources">

                <div className="resources-page">

                  {!resourceBranch && !resourceSubject && (
                    <>
                      <div className="resources-section-title">
                        <h3>{profileBranch}</h3>
                        <p>Choose a subject to view your study resources.</p>
                      </div>

                      <div className="branch-resource-grid">
                        <button
                          className="branch-resource-card"
                          onClick={() => {
                            setResourceBranch(profileBranch);
                            setResourceSubject(null);
                          }}
                        >
                          <span className="branch-icon">📚</span>
                          <div>
                            <h3>{profileBranch}</h3>
                            <p>View your branch resources</p>
                          </div>
                          <span className="resource-arrow">→</span>
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
                        <p>Select a subject to view resources shared by faculty.</p>
                      </div>

                      <div className="resource-subject-grid">
                        {(
                          profileBranch === "Information Technology"
                            ? ["ADSA", "Java", "DBMS", "FSJP", "ED"]
                            : []
                        ).map((subject) => (
                          <button
                            key={subject}
                            className="resource-subject-card"
                            onClick={() => setResourceSubject(subject)}
                          >
                            <span className="resource-subject-icon">📚</span>
                            <div>
                              <h3>{subject}</h3>
                              <p>View {subject} resources</p>
                            </div>
                            <span className="resource-arrow">→</span>
                          </button>
                        ))}

                        {profileBranch !== "Information Technology" && (
                          <div className="no-resources-message">
                            <span>📚</span>
                            <h3>Subjects will be added soon</h3>
                            <p>Resources for {profileBranch} will be available soon.</p>
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



                            <div className="resource-files-list">

                              {resources.filter((resource) =>
                                resource.branch === resourceBranch &&
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
                                        onClick={async () => {
                                          const filePath =
                                            resource.resourceUrl ||
                                            resource.fileUrl ||
                                            resource.fileData ||
                                            resource.link ||
                                            resource.url;

                                          if (!filePath) {
                                            alert("File URL is missing.");
                                            return;
                                          }

                                          // External website links open directly
                                          if (
                                            resource.link &&
                                            !resource.resourceUrl &&
                                            !resource.fileUrl &&
                                            !resource.fileData &&
                                            !resource.url
                                          ) {
                                            window.open(
                                              resource.link,
                                              "_blank",
                                              "noopener,noreferrer"
                                            );
                                            return;
                                          }

                                          const newTab = window.open("about:blank", "_blank");

                                          if (!newTab) {
                                            alert("Please allow pop-ups for Smart Buddy.");
                                            return;
                                          }

                                          try {
                                            const token = localStorage.getItem("token");

                                            if (!token) {
                                              newTab.close();
                                              alert("Please log in again.");
                                              return;
                                            }

                                            const fileUrl = filePath.startsWith("http")
                                              ? filePath
                                              : `${window.location.origin}${filePath.startsWith("/") ? "" : "/"
                                              }${filePath}`;

                                            const response = await fetch(fileUrl, {
                                              headers: {
                                                Authorization: `Bearer ${token}`
                                              }
                                            });

                                            if (!response.ok) {
                                              throw new Error(`File request failed: ${response.status}`);
                                            }


                                            const blob = await response.blob();

                                            const objectUrl = URL.createObjectURL(
                                              new Blob([blob], { type: "application/pdf" })
                                            );

                                            newTab.location.href = objectUrl;



                                          } catch (error) {
                                            console.error("Resource opening error:", error);
                                            newTab.close();

                                            alert(
                                              error.message ||
                                              "Unable to open the file. Please try again."
                                            );
                                          }
                                        }}
                                      >
                                        {resource.resourceUrl ||
                                          resource.fileUrl ||
                                          resource.fileData ||
                                          resource.url
                                          ? "📖 View"
                                          : "🔗 Open"}
                                      </button>




                                    </div>

                                  ))

                              )}

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