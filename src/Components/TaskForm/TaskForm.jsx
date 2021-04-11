import React, { useEffect, useState } from "react";
import { InputField } from "../common/InputField/InputField";
import { Formik, Form, FieldArray } from "formik";
import style from "./style.module.css";
import * as Yup from "yup";
import { toast } from "react-toastify";
import axios from "axios";
import {
  base_url,
  add_task_instruction_url,
  get_task_instruction_url,
  update_task_instruction_url,
  del_task_instruction_url,
} from "../../config.json";

export const TaskForm = () => {
  const [taskList, setTaskList] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const initialValues = {
    taskName: "",
    taskInstructionsList: [""],
  };

  const validateForm = () => {
    return Yup.object({
      taskName: Yup.string().required("Required"),
    });
  };

  const handleFormSubmit = async (values, actions) => {
    const schema = Yup.array().of(Yup.string().min(2));
    const isArrayValid = await schema.isValid(values.taskInstructionsList);
    if (isArrayValid) {
      if (selectedTask) {
        const response = await axios.post(
          base_url + update_task_instruction_url,
          values
        );
        if (response.status === 200) {
          setTaskList(
            taskList.map((task) => {
              if (task._id === response.data.message._id) {
                return response.data.message;
              }
              return task;
            })
          );
          setSelectedTask(null);
          actions.resetForm();
          toast.success("Task Instructions Updated");
        }
      } else {
        const response = await axios.post(
          base_url + add_task_instruction_url,
          values
        );
        if (response.status === 200) {
          setTaskList([...taskList, response.data.message]);
          actions.resetForm();
          toast.success("Task Instructions Added");
        }
      }
    } else {
      toast.error(
        "Instruction must be a string or add atleast one instruction"
      );
    }
  };

  const onDelTask = async (id) => {
    const response = await axios.delete(
      `${base_url}${del_task_instruction_url}/${id}`
    );
    if (response.status === 200) {
      setTaskList(taskList.filter((task) => task._id !== id));
      toast.success("Task deleted successfully");
    }
  };

  useEffect(() => {
    const getTasksList = async () => {
      const response = await axios.get(base_url + get_task_instruction_url);
      if (response.status === 200) {
        setTaskList(response.data.message);
      }
    };
    getTasksList();
  }, []);

  return (
    <div className={style.contentWrapper}>
      <h1>Working Instructions Application</h1>
      {taskList.length > 0 && (
        <div>
          <h3>Tasks List</h3>
          <ul className="list-group">
            {taskList.map((task) => (
              <>
                <li
                  key={task._id}
                  className="list-group-item d-flex justify-content-between align-items-center"
                >
                  {task.taskName}
                  <div>
                    <span
                      className={style.editText}
                      onClick={() => setSelectedTask(task)}
                    >
                      Edit
                    </span>
                    <span
                      className={style.delText}
                      onClick={() => onDelTask(task._id)}
                    >
                      Delete
                    </span>
                  </div>
                </li>
              </>
            ))}
          </ul>
        </div>
      )}

      <Formik
        enableReinitialize
        initialValues={selectedTask ? selectedTask : initialValues}
        onSubmit={handleFormSubmit}
        validationSchema={validateForm}
      >
        {({ values }) => (
          <Form>
            <h3>Add Instructions for Task</h3>
            <div className={style.flexEnd}>
              <button className="btn btn-primary" type="submit">
                Publish
              </button>
            </div>

            <label htmlFor="taskNamr">Task Name</label>
            <InputField name="taskName" />
            <FieldArray name="taskInstructionsList">
              {({ remove, push }) => (
                <div>
                  {values.taskInstructionsList.length > 0 &&
                    values.taskInstructionsList.map(
                      (taskInstructionList, index) => (
                        <div className={style.inputFlex} key={index}>
                          <InputField
                            name={`taskInstructionsList.${index}`}
                            placeholder={`Instruction ${index + 1}`}
                            type="text"
                          />
                          <button
                            type="button"
                            className="btn btn-danger"
                            onClick={() => remove(index)}
                          >
                            Delete
                          </button>
                        </div>
                      )
                    )}
                  <div className={style.flexStart}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => push("")}
                    >
                      Add Instruction
                    </button>
                  </div>
                </div>
              )}
            </FieldArray>
          </Form>
        )}
      </Formik>
    </div>
  );
};
