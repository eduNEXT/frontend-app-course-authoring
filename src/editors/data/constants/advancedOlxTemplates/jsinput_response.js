/* eslint-disable */
// ---
// metadata:
//     display_name: Custom JavaScript Display and Grading
//     markdown: !!null
//     showanswer: never
// data: |
const jsInputResponse = `<problem>
    <p>
        In these problems (also called custom JavaScript problems or JS Input
        problems), you add a problem or tool that uses JavaScript in Studio.
        Studio embeds the problem in an IFrame so that your learners can
        interact with it in the LMS. You can grade your learners' work using
        JavaScript and some basic Python, and the grading is integrated into the
        edX grading system.
    </p>
    <p>
        The JS Input problem that you create must use HTML, JavaScript, and
        cascading style sheets (CSS). You can use any application creation tool,
        such as the Google Web Toolkit (GWT), to create your JS Input problem.
    </p>
    <p>
        For more information, see
        <a href="https://docs.openedx.org/en/latest/educators/references/course_development/exercise_tools/custom_javascript.html" target="_blank">
        Custom JavaScript Problem</a> in <i>Building and Running an Open edX Course</i>.
    </p>
    <p>
        JavaScript developers can also see
        <a href="https://docs.openedx.org/en/latest/developers/references/developer_guide/extending_platform/extending.html" target="_blank">
        Custom JavaScript Applications</a> in the <i>Open edX Developer's Guide</i>.
    </p>
    <p>
        When you add the problem, be sure to select <strong>Settings</strong>
        to specify a <strong>Display Name</strong> and other values that apply.
        Also, be sure to specify a <strong>title</strong> attribute on the <strong>jsinput</strong> tag;
        this title is used for the title attribute on the generated IFrame. Generally,
        the title attribute on the IFrame should match the title tag of the HTML hosted
        within the IFrame, which is specified by the <strong>html_file</strong> attribute.
    </p>
    <p>You can use the following example problem as a model.</p>

    <customresponse cfn="check_function">
        <script type="loncapa/python">

<![CDATA[
import json
def check_function(e, ans):
    """
    "response" is a dictionary that contains two keys, "answer" and "state".
    The value of "answer" is the JSON string that "getGrade" returns.
    The value of "state" is the JSON string that "getState" returns.
    Clicking either "Submit" or "Save" registers the current state.
    """
    response = json.loads(ans)

    # You can use the value of the answer key to grade:
    answer = json.loads(response["answer"])
    return answer == "correct"

    # Or you can use the value of the state key to grade:
    """
    state = json.loads(response["state"])
    return state["selectedChoice"] == "correct"
    """
]]>

        </script>
        <p>This is paragraph text displayed before the IFrame.</p>
        <jsinput
            gradefn="JSInputDemo.getGrade"
            get_statefn="JSInputDemo.getState"
            set_statefn="JSInputDemo.setState"
            initial_state='{"selectedChoice": "incorrect1", "availableChoices": ["incorrect1", "correct", "incorrect2"]}'
            width="600"
            height="100"
            html_file="https://files.edx.org/custom-js-example/jsinput_example.html"
            title="Dropdown with Dynamic Text"
            sop="false"
        />
    </customresponse>
</problem>`;

export default jsInputResponse;
