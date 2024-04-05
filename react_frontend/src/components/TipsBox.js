import React from 'react';
import { SearchOutlined, CloseOutlined, QuestionOutlined, ProfileOutlined, DragOutlined, HomeFilled, FlagFilled } from '@ant-design/icons';
export default function RouteItem(props) {
    return (
        <div>
            <b>Basic operations:</b>
            <p>-Click on a location or a route to check the detail.</p>
            <p>-Click <DragOutlined /> button to open the move controller (not neccessary for mobile).</p>
            <p>-Click <QuestionOutlined /> button to reopen the tips instructions.</p>
            <b>How to caculate a route?</b>
            <p>-Click on a location to open detail pannel, click <HomeFilled /> button to set as start or click <FlagFilled /> button to set as end.</p>
            <p>-Your can also click <SearchOutlined /> button to set start and end from drop-down box.</p>
            <b>After caculation finished, you can...</b>
            <p>-Choose a route you want to display on the map.</p>
            <p>-Click <ProfileOutlined /> button to redisplay the list of caculated routes.</p>
            <p>-Click <CloseOutlined /> button to restore the original map display.</p>
        </div>
    );
}
