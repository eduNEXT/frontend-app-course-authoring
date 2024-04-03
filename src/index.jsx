import 'core-js/stable';
import 'regenerator-runtime/runtime';

import {
  APP_INIT_ERROR, APP_READY, subscribe, initialize, mergeConfig,
} from '@edx/frontend-platform';
import { AppProvider, ErrorPage } from '@edx/frontend-platform/react';
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Route, Switch } from 'react-router-dom';

import { initializeHotjar } from '@edx/frontend-enterprise-hotjar';
import { logError } from '@edx/frontend-platform/logging';
import messages from './i18n';

import initializeStore from './store';
import CourseAuthoringRoutes from './CourseAuthoringRoutes';
import Head from './head/Head';
import { StudioHome } from './studio-home';
import CourseRerun from './course-rerun';

import 'react-datepicker/dist/react-datepicker.css';
import './index.scss';

const App = () => {
  useEffect(() => {
    if (process.env.HOTJAR_APP_ID) {
      try {
        initializeHotjar({
          hotjarId: process.env.HOTJAR_APP_ID,
          hotjarVersion: process.env.HOTJAR_VERSION,
          hotjarDebug: !!process.env.HOTJAR_DEBUG,
        });
      } catch (error) {
        logError(error);
      }
    }
  }, []);

  return (
    <AppProvider store={initializeStore()}>
      <Head />
      <Switch>
        <Route path="/home">
          <StudioHome />
        </Route>
        <Route
          path="/course/:courseId"
          render={({ match }) => {
            const { params: { courseId } } = match;
            return (
              <CourseAuthoringRoutes courseId={courseId} />
            );
          }}
        />
        <Route
          path="/course_rerun/:courseId"
          render={({ match }) => {
            const { params: { courseId } } = match;
            return (
              <CourseRerun courseId={courseId} />
            );
          }}
        />
      </Switch>
    </AppProvider>
  );
};

subscribe(APP_READY, () => {
  ReactDOM.render(
    (<App />),
    document.getElementById('root'),
  );
});

subscribe(APP_INIT_ERROR, (error) => {
  ReactDOM.render(<ErrorPage message={error.message} />, document.getElementById('root'));
});

initialize({
  handlers: {
    config: () => {
      mergeConfig({
        SUPPORT_URL: process.env.SUPPORT_URL || null,
        SUPPORT_EMAIL: process.env.SUPPORT_EMAIL || null,
        LEARNING_BASE_URL: process.env.LEARNING_BASE_URL,
        EXAMS_BASE_URL: process.env.EXAMS_BASE_URL || null,
        CALCULATOR_HELP_URL: process.env.CALCULATOR_HELP_URL || null,
        ENABLE_PROGRESS_GRAPH_SETTINGS: process.env.ENABLE_PROGRESS_GRAPH_SETTINGS || 'false',
        ENABLE_TEAM_TYPE_SETTING: process.env.ENABLE_TEAM_TYPE_SETTING === 'true',
        BBB_LEARN_MORE_URL: process.env.BBB_LEARN_MORE_URL || '',
        STUDIO_BASE_URL: process.env.STUDIO_BASE_URL || null,
        STUDIO_SHORT_NAME: process.env.STUDIO_SHORT_NAME || null,
        TERMS_OF_SERVICE_URL: process.env.TERMS_OF_SERVICE_URL || null,
        PRIVACY_POLICY_URL: process.env.PRIVACY_POLICY_URL || null,
        ENABLE_ACCESSIBILITY_PAGE: process.env.ENABLE_ACCESSIBILITY_PAGE || 'false',
        NOTIFICATION_FEEDBACK_URL: process.env.NOTIFICATION_FEEDBACK_URL || null,
        ENABLE_NEW_EDITOR_PAGES: process.env.ENABLE_NEW_EDITOR_PAGES || 'false',
        ENABLE_UNIT_PAGE: process.env.ENABLE_UNIT_PAGE || 'false',
        ENABLE_ASSETS_PAGE: process.env.ENABLE_ASSETS_PAGE || 'false',
        ENABLE_VIDEO_UPLOAD_PAGE_LINK_IN_CONTENT_DROPDOWN: process.env.ENABLE_VIDEO_UPLOAD_PAGE_LINK_IN_CONTENT_DROPDOWN || 'false',
        ENABLE_TAGGING_TAXONOMY_PAGES: process.env.ENABLE_TAGGING_TAXONOMY_PAGES || 'false',
        ENABLE_CHECKLIST_QUALITY: process.env.ENABLE_CHECKLIST_QUALITY || 'true',
        ENABLE_GRADING_METHOD_IN_PROBLEMS: process.env.ENABLE_GRADING_METHOD_IN_PROBLEMS === 'true',
      }, 'CourseAuthoringConfig');
    },
  },
  messages,
  requireAuthenticatedUser: true,
});
