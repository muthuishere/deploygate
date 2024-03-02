const input = {
    stdout: [
        'ansible-playbook [core 2.16.0]',
        '  config file = None',
        "  configured module search path = ['/Users/muthuishere/.ansible/plugins/modules', '/usr/share/ansible/plugins/modules']",
        '  ansible python module location = /usr/local/Cellar/ansible/9.0.1/libexec/lib/python3.12/site-packages/ansible',
        '  ansible collection location = /Users/muthuishere/.ansible/collections:/usr/share/ansible/collections',
        '  executable location = /usr/local/bin/ansible-playbook',
        '  python version = 3.12.0 (main, Oct  5 2023, 15:52:37) [Clang 14.0.3 (clang-1403.0.22.14.1)] (/usr/local/Cellar/ansible/9.0.1/libexec/bin/python)',
        '  jinja version = 3.1.2',
        '  libyaml = True',
        'No config file found; using defaults',
        "Skipping callback 'default', as we already have a stdout callback.",
        "Skipping callback 'minimal', as we already have a stdout callback.",
        "Skipping callback 'oneline', as we already have a stdout callback.",
        'PLAYBOOK: bf7a7086-f69f-41fd-b121-4f97ac52f25e.yaml ****************************',
        '1 plays in /var/folders/jw/5xgrkks52gx722h_9mzf1cm00000gn/T/bf7a7086-f69f-41fd-b121-4f97ac52f25e.yaml',
        'PLAY [Get Domain Status for Nginx] *********************************************',
        'TASK [Gathering Facts] *********************************************************',
        'task path: /var/folders/jw/5xgrkks52gx722h_9mzf1cm00000gn/T/bf7a7086-f69f-41fd-b121-4f97ac52f25e.yaml:2',
        'ok: [muthuishere.com]',
        'TASK [Check if npm is installed] ***********************************************',
        'task path: /var/folders/jw/5xgrkks52gx722h_9mzf1cm00000gn/T/bf7a7086-f69f-41fd-b121-4f97ac52f25e.yaml:6',
        'changed: [muthuishere.com] => {"changed": true, "cmd": ["npm", "--version"], "delta": "0:00:00.918311", "end": "2024-03-02 13:21:26.159359", "failed_when_result": false, "msg": "", "rc": 0, "start": "2024-03-02 13:21:25.241048", "stderr": "", "stderr_lines": [], "stdout": "9.4.0", "stdout_lines": ["9.4.0"]}',
        'TASK [Check if nginx is installed] *********************************************',
        'task path: /var/folders/jw/5xgrkks52gx722h_9mzf1cm00000gn/T/bf7a7086-f69f-41fd-b121-4f97ac52f25e.yaml:11',
        'changed: [muthuishere.com] => {"changed": true, "cmd": "nginx -v", "delta": "0:00:00.009905", "end": "2024-03-02 13:21:30.583192", "msg": "", "rc": 0, "start": "2024-03-02 13:21:30.573287", "stderr": "nginx version: nginx/1.18.0 (Ubuntu)", "stderr_lines": ["nginx version: nginx/1.18.0 (Ubuntu)"], "stdout": "", "stdout_lines": []}',
        'TASK [Install nginx if not installed] ******************************************',
        'task path: /var/folders/jw/5xgrkks52gx722h_9mzf1cm00000gn/T/bf7a7086-f69f-41fd-b121-4f97ac52f25e.yaml:16',
        'skipping: [muthuishere.com] => {"changed": false, "false_condition": "nginx_version.rc != 0", "skip_reason": "Conditional result was False"}',
        'TASK [Install nginx-domain-assist globally] ************************************',
        'task path: /var/folders/jw/5xgrkks52gx722h_9mzf1cm00000gn/T/bf7a7086-f69f-41fd-b121-4f97ac52f25e.yaml:22',
        'changed: [muthuishere.com] => {"changed": true, "cmd": "npm install -g nginx-domain-assist", "delta": "0:00:04.015777", "end": "2024-03-02 13:21:39.013757", "msg": "", "rc": 0, "start": "2024-03-02 13:21:34.997980", "stderr": "", "stderr_lines": [], "stdout": "\\nchanged 84 packages in 4s\\n\\n22 packages are looking for funding\\n  run `npm fund` for details", "stdout_lines": ["", "changed 84 packages in 4s", "", "22 packages are looking for funding", "  run `npm fund` for details"]}',
        'TASK [Run domain-status-by-name command] ***************************************',
        'task path: /var/folders/jw/5xgrkks52gx722h_9mzf1cm00000gn/T/bf7a7086-f69f-41fd-b121-4f97ac52f25e.yaml:25',
        'changed: [muthuishere.com] => {"changed": true, "cmd": "domain-status-by-name --domain \\"test.com\\"", "delta": "0:00:00.367672", "end": "2024-03-02 13:21:43.754898", "msg": "", "rc": 0, "start": "2024-03-02 13:21:43.387226", "stderr": "", "stderr_lines": [], "stdout": "{\\n  \\"isAvailable\\": false,\\n  \\"isEnabled\\": false,\\n  \\"port\\": null\\n}", "stdout_lines": ["{", "  \\"isAvailable\\": false,", "  \\"isEnabled\\": false,", "  \\"port\\": null", "}"]}',
        'PLAY RECAP *********************************************************************',
        'muthuishere.com            : ok=5    changed=4    unreachable=0    failed=0    skipped=1    rescued=0    ignored=0   '
    ],
    stderr: [],
    code: 0
}

describe('playbookResultParser', () => {

    it('should able to get the line which contains string ', async () => {




        // add block here
    });
});


