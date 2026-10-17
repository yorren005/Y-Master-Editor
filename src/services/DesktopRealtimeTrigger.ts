// src/services/DesktopRealtimeTrigger.ts
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import pkg from '../../package.json';

export function subscribeToInstantDesktopRelease(
  onNewRelease: (version: string, notes: string) => void
) {
  return onSnapshot(doc(db, 'app_meta', 'desktop_release'), (snap) => {
    if (!snap.exists()) return;
    const data = snap.data();
    if (data.version && data.version !== pkg.version) {
      // Tell Electron Main process to fetch latest.yml from GitHub Releases immediately
      if (typeof window !== 'undefined' && (window as any).electronUpdater) {
        (window as any).electronUpdater.check();
      }
      onNewRelease(data.version, data.releaseNotes || '');
    }
  });
}
