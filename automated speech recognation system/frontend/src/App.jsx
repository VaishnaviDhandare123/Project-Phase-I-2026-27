import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

// Standard ASR Pages
import { DashboardPage } from './pages/DashboardPage';
import { SpeechToTextPage } from './pages/SpeechToTextPage';
import { LiveTranscriptionPage } from './pages/LiveTranscriptionPage';
import { PreprocessingPage } from './pages/PreprocessingPage';
import { EditorPage } from './pages/EditorPage';
import { HistoryPage } from './pages/HistoryPage';
import { DetailsPage } from './pages/DetailsPage';

// Research Pages
import { SpeechAnalysisPage } from './pages/SpeechAnalysisPage';
import { AcousticFeaturesPage } from './pages/AcousticFeaturesPage';
import { DysarthricResearchPage } from './pages/DysarthricResearchPage';
import { DatasetManagementPage } from './pages/DatasetManagementPage';
import { SyntheticAugmentationPage } from './pages/SyntheticAugmentationPage';
import { ModelTrainingPage } from './pages/ModelTrainingPage';
import { ExperimentManagementPage } from './pages/ExperimentManagementPage';
import { PCAPage } from './pages/PCAPage';
import { TSNEPage } from './pages/TSNEPage';
import { ModelEvaluationPage } from './pages/ModelEvaluationPage';
import { ModelComparisonPage } from './pages/ModelComparisonPage';
import { ReportsPage } from './pages/ReportsPage';

// System Pages
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { AboutPage } from './pages/AboutPage';

export const App = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Authenticated / Guest Layout Pages */}
      <Route element={<AppLayout />}>
        {/* Standard ASR */}
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/speech-to-text" element={<SpeechToTextPage />} />
        <Route path="/live" element={<LiveTranscriptionPage />} />
        <Route path="/preprocessing" element={<PreprocessingPage />} />
        <Route path="/editor" element={<EditorPage />} />
        <Route path="/editor/:id" element={<EditorPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/history/:id" element={<DetailsPage />} />

        {/* Research & Speech Analysis */}
        <Route path="/speech-analysis" element={<SpeechAnalysisPage />} />
        <Route path="/acoustic-features" element={<AcousticFeaturesPage />} />
        <Route path="/dysarthric-research" element={<DysarthricResearchPage />} />
        <Route path="/datasets" element={<DatasetManagementPage />} />
        <Route path="/augmentation" element={<SyntheticAugmentationPage />} />
        <Route path="/training" element={<ModelTrainingPage />} />
        <Route path="/experiments" element={<ExperimentManagementPage />} />
        <Route path="/pca" element={<PCAPage />} />
        <Route path="/tsne" element={<TSNEPage />} />
        <Route path="/evaluation" element={<ModelEvaluationPage />} />
        <Route path="/comparison" element={<ModelComparisonPage />} />
        <Route path="/reports" element={<ReportsPage />} />

        {/* System & Account */}
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/about" element={<AboutPage />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
