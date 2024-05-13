import React, { useState, useContext } from "react";
import { useHttpClient } from "../../shared/hooks/http-hook";

import Card from "../../shared/components/UIElements/Card";
import Button from "../../shared/components/FormElements/Button";
import Modal from "../../shared/components/UIElements/Modal";
import Map from "../../shared/components/UIElements/Map";
import { AuthContext } from "../../shared/context/auth-context";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import "./PlaceItem.css";

/* 
<PlaceItem
  key={place.id}
  id={place.id}
  image={place.image}
  title={place.title}
  desc={place.description}
  address={place.address}
  creatorId={place.creator}
  coords={place.location}
/>
*/

const PlaceItem = (props) => {
  const auth = useContext(AuthContext);
  const { isLoading, error, sendRequest, clearError } = useHttpClient();

  const [showMap, setShowMap] = useState(false);
  const openMapHandler = () => setShowMap(true);
  const closeMapHandler = () => setShowMap(false);

  const [showConfirm, setConfirm] = useState(false);
  const showDeleteWarningHandler = () => setConfirm(true);
  const cancelDeleteWarningHandler = () => setConfirm(false);
  const confirmDeleteWarningHandler = async () => {
    setConfirm(false);
    try {
      await sendRequest(
        `http://localhost:5000/api/places/${props.id}`,
        "DELETE"
      );
      // cant use history bc need to update the list of places being shown 
      props.onDelete(props.id);
    } catch (e) {}
  };

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      <Modal
        show={showMap}
        onCancel={closeMapHandler}
        header={props.address}
        contentClass="place-utem__modal-content"
        footerClass="place-item__modal-actions"
        footer={<Button onClick={closeMapHandler}>CLOSE</Button>}
      >
        <div className="map-container">
          <Map center={props.coords} zoom={16} />
        </div>
      </Modal>
      <Modal
        show={showConfirm}
        onCancel={cancelDeleteWarningHandler}
        header="are you sure?"
        footerClass="place-item__modal-actions"
        footer={
          <React.Fragment>
            <Button inverse onClick={cancelDeleteWarningHandler}>
              changed my mind
            </Button>
            <Button danger onClick={confirmDeleteWarningHandler}>
              delete away
            </Button>
          </React.Fragment>
        }
      >
        <p>it cant be undone</p>
      </Modal>
      <li className="place-item">
        <Card className="place-item__content">
          {isLoading && <LoadingSpinner asOverlay/>}
          <div className="place-item__image">
            <img src={props.image} alt={props.title} />
          </div>
          <div className="place-item__info">
            <h2>{props.title}</h2>
            <h3>{props.address}</h3>
            <p>{props.desc}</p>
          </div>
          <div className="place-item__actions">
            <Button inverse onClick={openMapHandler}>
              VIEW ON MAP
            </Button>
            {auth.userId === props.creatorId && (
              <Button to={`/places/${props.id}`}>EDIT</Button>
            )}
            {auth.userId === props.creatorId && (
              <Button danger onClick={showDeleteWarningHandler}>
                DELETE
              </Button>
            )}
          </div>
        </Card>
      </li>
    </React.Fragment>
  );
};

export default PlaceItem;
