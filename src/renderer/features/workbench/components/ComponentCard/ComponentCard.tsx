import React from 'react';
import { Card, CardContent, Typography, Tooltip, ButtonBase } from '@material-ui/core';
import componentDefault from '../../../../../../assets/imgs/component-default.svg';
import { ComponentGroup } from '../../../../../api/types';

interface ComponentCardProps {
  component: ComponentGroup;
  onClick: (component) => void;
}

const ComponentCard = ({ component, onClick }: ComponentCardProps) => {
  const multiple: boolean = component.versions.length > 1;

  return (
    <>
      <Card className={`component-card ${multiple && 'multiple'}`} elevation={1}>
        <ButtonBase onClick={() => onClick(component)}>
          <CardContent className="component-card-content">
            <figure>
              <img alt="component logo" src={componentDefault} />
            </figure>
            <div className="component-card-info">
              <p>{multiple ? `${component.versions.length} versions` : component.versions[0].version}</p>
              <Tooltip title={component.name}>
                <Typography variant="h6" gutterBottom>
                  {component.name}
                </Typography>
              </Tooltip>
            </div>
            <div className="component-card-files">
              {component.summary.identified !== 0 ? (
                <span className="info-count identified">{component.summary.identified}</span>
              ) : null}
              {component.summary.pending !== 0 ? (
                <span className="info-count pending">{component.summary.pending}</span>
              ) : null}
              {component.summary.ignored !== 0 ? (
                <span className="info-count ignored">{component.summary.ignored}</span>
              ) : null}
            </div>
          </CardContent>
        </ButtonBase>
      </Card>
    </>
  );
};

export default ComponentCard;