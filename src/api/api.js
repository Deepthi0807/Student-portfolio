const STORAGE_KEYS = {
  users: "fsad_users",
  projects: "fsad_projects",
  token: "token",
  currentUser: "fsad_current_user",
};


const delay = (value) =>
  new Promise((resolve) => {
    setTimeout(() => resolve(value), 150);
  });

const readStorage = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const writeStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const createId = (prefix) =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const toPublicUser = (user) => ({
  id: user.id,
  name: user.name,
  role: user.role,
  studentId: user.studentId,
  email: user.email,
});

const removeDemoData = () => {
  const users = readStorage(STORAGE_KEYS.users, []);
  const projects = readStorage(STORAGE_KEYS.projects, []);
  const demoUserIds = ["admin_1", "student_1"];
  const demoProjectIds = ["project_1"];
  const filteredUsers = users.filter((user) => !demoUserIds.includes(user.id));
  const filteredProjects = projects.filter(
    (project) => !demoProjectIds.includes(project._id)
  );

  if (filteredUsers.length !== users.length) {
    writeStorage(STORAGE_KEYS.users, filteredUsers);
  }

  if (filteredProjects.length !== projects.length) {
    writeStorage(STORAGE_KEYS.projects, filteredProjects);
  }

  const currentUser = getCurrentUser();

  if (currentUser && demoUserIds.includes(currentUser.id)) {
    localStorage.removeItem(STORAGE_KEYS.token);
    localStorage.removeItem(STORAGE_KEYS.currentUser);
  }
};

const ensureSeedData = () => {
  const users = readStorage(STORAGE_KEYS.users, null);

  if (users) {
    removeDemoData();
    return;
  }

  writeStorage(STORAGE_KEYS.users, []);
  writeStorage(STORAGE_KEYS.projects, []);
};

const getUsers = () => {
  ensureSeedData();
  return readStorage(STORAGE_KEYS.users, []);
};

const saveUsers = (users) => {
  writeStorage(STORAGE_KEYS.users, users);
};

const getProjects = () => {
  ensureSeedData();
  return readStorage(STORAGE_KEYS.projects, []);
};

const saveProjects = (projects) => {
  writeStorage(STORAGE_KEYS.projects, projects);
};

const getCurrentUser = () => readStorage(STORAGE_KEYS.currentUser, null);

const setCurrentSession = (user) => {
  const publicUser = toPublicUser(user);
  const token = `local_${user.id}_${Date.now()}`;

  localStorage.setItem(STORAGE_KEYS.token, token);
  writeStorage(STORAGE_KEYS.currentUser, publicUser);

  return { token, user: publicUser };
};

const requireCurrentUser = () => {
  const user = getCurrentUser();

  if (!user) {
    throw new Error("Please sign in first.");
  }

  return user;
};

const nextStudentId = () => {
  const studentIds = getUsers()
    .map((user) => Number(user.studentId))
    .filter(Boolean);
  const nextId = studentIds.length ? Math.max(...studentIds) + 1 : 240003001;

  return String(nextId);
};

export const authAPI = {
  getCurrentUser: async () => delay(getCurrentUser()),

  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.token);
    localStorage.removeItem(STORAGE_KEYS.currentUser);
  },

  login: async (credentials) => {
    const username = credentials.username?.trim().toLowerCase();
    const password = credentials.password?.trim();

    const user = getUsers().find(
      (item) => item.username.toLowerCase() === username && item.password === password
    );

    if (!user) {
      throw new Error("Invalid username or password.");
    }

    return delay(setCurrentSession(user));
  },

  register: async (userData) => {
    const name = userData.name?.trim();
    const email = userData.email?.trim();
    const username = userData.username?.trim();
    const password = userData.password?.trim();
    const confirmPassword = userData.confirmPassword?.trim();

    if (!name || !email || !username || !password || !confirmPassword) {
      throw new Error("Please fill in all fields.");
    }

    if (password !== confirmPassword) {
      throw new Error("Passwords do not match.");
    }

    const users = getUsers();
    const usernameExists = users.some(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );

    if (usernameExists) {
      throw new Error("Username already exists.");
    }

    const role = username.toLowerCase().includes("admin") ? "admin" : "student";
    const user = {
      id: createId(role),
      name,
      email,
      username,
      password,
      role,
      studentId: role === "student" ? nextStudentId() : "",
    };

    saveUsers([...users, user]);

    return delay(setCurrentSession(user));
  },
};

export const studentAPI = {
  getProjects: async () => {
    const user = requireCurrentUser();
    const projects = getProjects().filter(
      (project) => project.studentId === user.studentId
    );

    return delay(projects);
  },

  createProject: async (project) => {
    const user = requireCurrentUser();
    const newProject = {
      _id: createId("project"),
      studentId: user.studentId,
      title: project.title,
      description: project.description,
      milestone: project.milestone,
      progress: Number(project.progress) || 0,
      media: project.media,
      reviewed: false,
      feedback: "",
    };

    saveProjects([newProject, ...getProjects()]);

    return delay(newProject);
  },

  updateProject: async (id, project) => {
    const user = requireCurrentUser();
    let updatedProject = null;
    const projects = getProjects().map((item) => {
      if (item._id !== id || item.studentId !== user.studentId) {
        return item;
      }

      updatedProject = { ...item, ...project, _id: item._id, studentId: item.studentId };
      return updatedProject;
    });

    if (!updatedProject) {
      throw new Error("Project not found.");
    }

    saveProjects(projects);

    return delay(updatedProject);
  },

  deleteProject: async (id) => {
    const user = requireCurrentUser();
    const projects = getProjects();
    const remainingProjects = projects.filter(
      (project) => !(project._id === id && project.studentId === user.studentId)
    );

    saveProjects(remainingProjects);

    return delay({ message: "Project deleted" });
  },
};

export const adminAPI = {
  getStudents: async () => {
    const projects = getProjects();
    const students = getUsers()
      .filter((user) => user.role === "student")
      .map((user) => {
        const studentProjects = projects.filter(
          (project) => project.studentId === user.studentId
        );
        const reviewed = studentProjects.filter((project) => project.reviewed).length;

        return {
          id: user.studentId,
          name: user.name,
          email: user.email,
          projects: studentProjects.length,
          reviewed,
          pending: studentProjects.length - reviewed,
        };
      });

    return delay(students);
  },

  getStudentProjects: async (studentId) => {
    const projects = getProjects().filter((project) => project.studentId === studentId);

    return delay(projects);
  },

  addFeedback: async (projectId, feedback) => {
    let wasUpdated = false;
    const projects = getProjects().map((project) => {
      if (project._id !== projectId) {
        return project;
      }

      wasUpdated = true;
      return {
        ...project,
        feedback,
        reviewed: true,
      };
    });

    if (!wasUpdated) {
      throw new Error("Project not found.");
    }

    saveProjects(projects);

    return delay({ message: "Feedback saved successfully" });
  },
};
