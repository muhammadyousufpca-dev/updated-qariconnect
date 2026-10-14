import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { AppUser, QariProfile, UserRole } from '../types';
import { INITIAL_SEED_QARIS } from '../data/seedQaris';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: AppUser | null;
  qariProfile: QariProfile | null;
  loading: boolean;
  isDemoUser: boolean;
  isSuperAdmin: boolean;
  demoRole: UserRole | null;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  setUserRole: (role: UserRole) => Promise<void>;
  saveQariProfile: (profile: Partial<QariProfile>) => Promise<void>;
  activateDemoPersona: (role: UserRole, personaUid?: string) => Promise<void>;
  exitDemoMode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Persistent active account key for non-Google session selection across refreshes
const ACTIVE_ACCOUNT_KEY = 'qariconnect_active_uid';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<AppUser | null>(null);
  const [qariProfile, setQariProfile] = useState<QariProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDemoUser, setIsDemoUser] = useState<boolean>(false);
  const [demoRole, setDemoRole] = useState<UserRole | null>(null);

  // Load user profile and Qari profile directly from Firestore
  const fetchUserProfile = async (uid: string) => {
    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data() as AppUser;
        setUserProfile(data);

        // If user is a Qari, fetch their QariProfile from Firestore
        if (data.role === 'qari') {
          const qariRef = doc(db, 'qari_profiles', uid);
          const qariSnap = await getDoc(qariRef);
          if (qariSnap.exists()) {
            setQariProfile(qariSnap.data() as QariProfile);
          } else {
            // Seed profile from INITIAL_SEED_QARIS if available
            const seed = INITIAL_SEED_QARIS.find((q) => q.qariId === uid);
            if (seed) {
              await setDoc(qariRef, seed, { merge: true });
              setQariProfile(seed);
            } else {
              setQariProfile(null);
            }
          }
        } else {
          setQariProfile(null);
        }
      } else {
        // Auto-provision demo persona if user doesn't exist yet in Firestore
        let fallbackUser: AppUser | null = null;
        if (uid === 'demo_parent_user') {
          fallbackUser = {
            uid: 'demo_parent_user',
            email: 'parent.tariq@qariconnect.org',
            displayName: 'Tariq Mahmood (Parent)',
            role: 'parent',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        } else if (uid === 'seed_qari_1') {
          fallbackUser = {
            uid: 'seed_qari_1',
            email: 'ahmad.almasri@qariconnect.org',
            displayName: 'Sheikh Ahmad Al-Masri',
            role: 'qari',
            avatarUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=400',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        } else if (uid === 'seed_qari_2') {
          fallbackUser = {
            uid: 'seed_qari_2',
            email: 'maryam.siddiqui@qariconnect.org',
            displayName: 'Ustadha Maryam Siddiqui',
            role: 'qari',
            avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        } else if (uid === 'seed_qari_3') {
          fallbackUser = {
            uid: 'seed_qari_3',
            email: 'bilal.tariq@qariconnect.org',
            displayName: 'Sheikh Bilal Tariq',
            role: 'qari',
            avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        } else if (uid === 'demo_admin_user' || uid === 'super_admin') {
          fallbackUser = {
            uid: 'demo_admin_user',
            email: 'admin@qariconnect.org',
            displayName: 'Super Admin (Operations)',
            role: 'admin',
            avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=400',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        }

        if (fallbackUser) {
          try {
            await setDoc(userRef, fallbackUser);
          } catch {
            // Ignore if write has delay
          }
          setUserProfile(fallbackUser);

          if (fallbackUser.role === 'qari') {
            const seed = INITIAL_SEED_QARIS.find((q) => q.qariId === uid);
            if (seed) {
              const qariRef = doc(db, 'qari_profiles', uid);
              try {
                await setDoc(qariRef, seed, { merge: true });
              } catch {
                // Ignore
              }
              setQariProfile(seed);
            } else {
              setQariProfile(null);
            }
          } else {
            setQariProfile(null);
          }
        } else {
          setUserProfile(null);
          setQariProfile(null);
        }
      }
    } catch (err) {
      console.error('Error fetching user profile from Firestore:', err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        setIsDemoUser(false);
        setDemoRole(null);
        localStorage.removeItem(ACTIVE_ACCOUNT_KEY);
        await fetchUserProfile(user.uid);
      } else {
        // When not signed in with Google, check if user had activated a persona
        const savedUid = localStorage.getItem(ACTIVE_ACCOUNT_KEY) || 'demo_parent_user';
        setIsDemoUser(true);
        await fetchUserProfile(savedUid);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Save or update user document in Firestore
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        const newUser: AppUser = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || 'Quran Student / Parent',
          role: 'parent',
          avatarUrl: user.photoURL || undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await setDoc(userRef, newUser);
        setUserProfile(newUser);
      } else {
        await fetchUserProfile(user.uid);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'users');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (isDemoUser) {
      exitDemoMode();
      return;
    }
    try {
      await signOut(auth);
      localStorage.removeItem(ACTIVE_ACCOUNT_KEY);
      setUserProfile(null);
      setQariProfile(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const setUserRole = async (role: UserRole) => {
    const uid = currentUser?.uid || userProfile?.uid || 'demo_parent_user';
    try {
      const userRef = doc(db, 'users', uid);
      await setDoc(
        userRef,
        {
          role,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      setUserProfile((prev) => (prev ? { ...prev, role } : null));

      if (role === 'qari') {
        const qariRef = doc(db, 'qari_profiles', uid);
        const qariSnap = await getDoc(qariRef);
        if (qariSnap.exists()) {
          setQariProfile(qariSnap.data() as QariProfile);
        } else {
          // Initialize empty profile in Firestore
          const initialQari: QariProfile = {
            qariId: uid,
            fullName: userProfile?.displayName || 'Quran Instructor',
            title: 'Quran & Tajweed Instructor',
            bio: 'Assalamu Alaikum. Dedicated Quran teacher certified to teach students of all ages.',
            country: 'Global',
            languages: ['English', 'Arabic'],
            experienceYears: 5,
            hasSanad: false,
            qualifications: 'Quran Memorization & Tajweed Certified',
            tajweedSpecialization: 'Makharij, Sifat, and basic Tajweed rules',
            hourlyFee: 15,
            monthlyFee: 100,
            preferredAgeGroups: ['Children (6-12)', 'Teens (13-18)'],
            availability: 'Weekdays 16:00 - 20:00 GMT',
            avatarUrl: userProfile?.avatarUrl,
            isVerified: false,
            rating: 5.0,
            reviewCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          await setDoc(qariRef, initialQari);
          setQariProfile(initialQari);
        }
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${uid}`);
    }
  };

  const saveQariProfile = async (profileData: Partial<QariProfile>) => {
    const uid = currentUser?.uid || userProfile?.uid || 'seed_qari_1';
    try {
      const qariRef = doc(db, 'qari_profiles', uid);
      const updated = {
        ...profileData,
        qariId: uid,
        updatedAt: new Date().toISOString(),
      };
      await setDoc(qariRef, updated, { merge: true });

      const snap = await getDoc(qariRef);
      if (snap.exists()) {
        setQariProfile(snap.data() as QariProfile);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `qari_profiles/${uid}`);
    }
  };

  const activateDemoPersona = async (role: UserRole, personaUid?: string) => {
    setIsDemoUser(true);
    setDemoRole(role);
    const targetUid =
      personaUid ||
      (role === 'admin'
        ? 'demo_admin_user'
        : role === 'parent'
        ? 'demo_parent_user'
        : 'seed_qari_1');
    localStorage.setItem(ACTIVE_ACCOUNT_KEY, targetUid);
    await fetchUserProfile(targetUid);
  };

  const exitDemoMode = async () => {
    setIsDemoUser(false);
    setDemoRole(null);
    localStorage.removeItem(ACTIVE_ACCOUNT_KEY);
    if (!currentUser) {
      setUserProfile(null);
      setQariProfile(null);
    } else {
      await fetchUserProfile(currentUser.uid);
    }
  };

  const isSuperAdmin =
    userProfile?.role === 'admin' ||
    userProfile?.email === 'muhammadyousufpca@gmail.com' ||
    Boolean(userProfile?.email?.toLowerCase().includes('admin'));

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        qariProfile,
        loading,
        isDemoUser,
        isSuperAdmin,
        demoRole,
        signInWithGoogle,
        logout,
        setUserRole,
        saveQariProfile,
        activateDemoPersona,
        exitDemoMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
