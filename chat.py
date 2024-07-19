import json
import io
from flask import Flask, jsonify, request, render_template, Response
from openai import OpenAI
import re
from flask_cors import CORS

app = Flask(__name__)


@app.route("/")
def chat():
    return render_template('index.html')


class OpenAI_API:
    def __init__(self, key, asst_id, vs_ids):
        self.client = OpenAI(api_key=key)
        self.asst_id = asst_id
        self.assistant = self.client.beta.assistants.retrieve(asst_id)
        self.vs_ids = vs_ids
        self.thread = self.client.beta.threads.create(
            tool_resources={
                "file_search": {
                    "vector_store_ids": vs_ids
                }
            }
        )
        self.client.beta.threads.messages.create(
            thread_id=self.thread.id,
            role="user",
            content="Hello! How can I assist you today?"
        )

    def sendMessageAndGetResponse(self, message):
        message = self.client.beta.threads.messages.create(
            thread_id=self.thread.id,
            role="user",
            content=message
        )
        run = self.client.beta.threads.runs.create_and_poll(
            thread_id=self.thread.id,
            assistant_id=self.assistant.id,
            instructions="Please help the user with their onboarding questions. Base your responses based on the files you have access to. If a user asks about a setup task, provide a link to its setup page if possible."
        )
        if run.status == 'completed':
            messages = self.client.beta.threads.messages.list(thread_id=self.thread.id)
            return re.sub(r'\n', '<br>', re.sub(r"【.*?】", '', messages.data[0].content[0].text.value))
        else:
            self.client.beta.threads.messages.delete(
                message_id=message.id,
                thread_id=self.thread.id,
            )
            return "message failed to return, please try again."

    def resetThread(self):
        self.thread = self.client.beta.threads.create(
            tool_resources={
                "file_search": {
                    "vector_store_ids": self.vs_ids
                }
            }
        )
        self.client.beta.threads.messages.create(
            thread_id=self.thread.id,
            role="user",
            content="Hello! How can I assist you today?"
        )
        self.assistant = self.client.beta.assistants.retrieve(self.asst_id)

    def upload_file(self, filename, file_to_upload):
        file_to_upload = io.BytesIO(file_to_upload.read())
        file_to_upload.name = filename
        file_batch = self.client.beta.vector_stores.file_batches.upload_and_poll(
            vector_store_id=self.vs_ids[0], files=[file_to_upload]
        )
        print(file_batch.status)
        self.assistant = self.client.beta.assistants.update(
            assistant_id=self.assistant.id,
            tool_resources={"file_search": {"vector_store_ids": [self.vs_ids[0]]}},
        )


f = open("keys.txt", "r")
api_client = OpenAI_API(f.readline().strip(), f.readline().strip(), [f.readline().strip()])

CORS(app)

@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        res = Response()
        res.headers['X-Content-Type-Options'] = '*'
        return res


@app.route('/assistant', methods=['POST'])
def get_message():
    request_data = request.get_json()
    output = api_client.sendMessageAndGetResponse(request_data['message'])
    print(output)
    return jsonify({'output': fr'{output}'})

@app.route('/files', methods=['POST'])
def send_file():
    api_client.upload_file(request.form['filename'], request.files['uploadedFile'])
    return jsonify(message="OK"), 200