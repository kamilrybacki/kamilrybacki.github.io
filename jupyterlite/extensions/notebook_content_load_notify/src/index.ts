import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

/**
 * Initialization data for the notebook-content-load-notify extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'notebook-content-load-notify:plugin',
  description: 'An extension that notifies the IFrame host that notebook content has loaded',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    console.log('JupyterLab extension notebook-content-load-notify is activated!');

    const notifyNotebookContentLoaded = (): void => {
      const message = { type: 'from-iframe-to-host', notebookContentLoaded: true };
      window.parent.postMessage(message, '*');
    }

    app.serviceManager.sessions.runningChanged
      .connect(() => {
        const notebookContentLoaded = document.querySelector('.jp-NotebookPanel') !== null;
        if (notebookContentLoaded) {
          notifyNotebookContentLoaded();
      }
      });
  }
};

export default plugin;
