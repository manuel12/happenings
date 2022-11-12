import React, { useEffect, useState } from "react";
import { useUserStore } from "../../store/userStore";
import { supabaseClient } from "../../supabase/client";
import { Button, Empty, Layout, Spin, Tag, Timeline } from "antd";
import "./style.css";
import EventForm from "../EventForm";
import { PlusOutlined } from "@ant-design/icons";
import { Content } from "antd/lib/layout/layout";
import NavBar from "../NavBar";
import { handleError } from "../../util";
import { loadingIcon } from "../PublicTimeline";

export default function MyTimeline() {
  const [timeline, setTimeline] = useState([]);
  const [event, setEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const user = useUserStore((state) => state.user);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEvent(null);
  };

  async function fetchTimeline() {
    setIsLoading(true);
    const { data, error } = await supabaseClient
      .from("timeline")
      .select()
      .eq("user_id", user.id)
      .order("date", { ascending: false });

    handleError(error);
    if (data) {
      setTimeline(data);
    }
    setIsLoading(false);
  }

  useEffect(() => {
    if (user?.id) {
      fetchTimeline();
    }
  }, [user]);

  return (
    <>
      <Layout style={{ height: "100%" }}>
        <NavBar />
        <Content
          className="site-layout"
          style={{ padding: "0 50px", backgroundColor: "white" }}
        >
          <div className="site-layout-background" style={{ padding: 24 }}>
            <Timeline mode="alternate">
              {user && (
                <Timeline.Item>
                  <Button
                    className="addEvent"
                    onClick={showModal}
                    type="primary"
                    shape="circle"
                    icon={<PlusOutlined />}
                  />
                </Timeline.Item>
              )}
              {isLoading && (
                <div className="loader">
                  <Spin indicator={loadingIcon} />
                </div>
              )}
              {!isLoading &&
                timeline.map((event) => (
                  <Timeline.Item key={event.event_id}>
                    <>
                      <Tag color="processing">{event.date}</Tag>
                      <h1 style={{ margin: 0 }}>{event.title} </h1>

                      <p>{event.description}</p>
                      <Button
                        onClick={() => {
                          showModal();
                          setEvent(event);
                        }}
                        size="small"
                        shape="round"
                      >
                        Edit
                      </Button>
                    </>
                  </Timeline.Item>
                ))}
              {!isLoading && timeline.length === 0 && (
                <div className="empty">
                  <Empty
                    description={false}
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                  <p className="emptymessage">Empty Timeline</p>
                </div>
              )}
            </Timeline>
            {isModalOpen && (
              <EventForm
                isModalOpen={isModalOpen}
                event={event}
                fetchTimeline={fetchTimeline}
                closeModal={closeModal}
              />
            )}
          </div>
        </Content>
      </Layout>
    </>
  );
}