import * as React from 'react'
import * as Styles from '../../styles'
import {LayoutChangeEvent} from 'react-native'
import PopupDialog from '../popup-dialog'
import ScrollView from '../scroll-view'
import {Box2, Box} from '../box'
import BoxGrow from '../box-grow'
import Text from '../text'
import {useTimeout} from '../use-timers'

const Kb = {
  Box,
  Box2,
  BoxGrow,
  ScrollView,
  Text,
  useTimeout,
}

type HeaderProps = {
  hideBorder?: boolean
  icon?: React.ReactNode // above center
  leftButton?: React.ReactNode
  rightButton?: React.ReactNode
  title?: React.ReactNode // center; be sure to lineClamp any long / dynamic strings
  style?: Styles.StylesCrossPlatform
}

type FooterProps = {
  content: React.ReactNode
  hideBorder?: boolean
  style?: Styles.StylesCrossPlatform
}

type Props = {
  banners?: React.ReactNode[]
  children: React.ReactNode
  header?: HeaderProps
  onClose?: () => void
  footer?: FooterProps
  mode: 'Default' | 'Wide'
}

const ModalInner = (props: Props) => (
  <>
    {!!props.header && <Header {...props.header} />}
    {!!props.banners && props.banners}
    <Kb.ScrollView
      alwaysBounceVertical={false}
      style={props.mode === 'Wide' ? styles.scrollWide : undefined}
      contentContainerStyle={styles.scrollContentContainer}
    >
      {props.children}
    </Kb.ScrollView>
    {!!props.footer && <Footer {...props.footer} wide={props.mode === 'Wide'} />}
  </>
)
const Modal = (props: Props) =>
  Styles.isMobile ? (
    <Kb.Box2 direction="vertical" fullWidth={true} fullHeight={true}>
      <ModalInner {...props} />
    </Kb.Box2>
  ) : (
    <PopupDialog
      onClose={props.onClose}
      styleClipContainer={props.mode === 'Default' ? styles.modeDefault : styles.modeWide}
    >
      <ModalInner {...props} />
    </PopupDialog>
  )
Modal.defaultProps = {
  mode: 'Default',
}

const Header = (props: HeaderProps) => {
  // On native, let the header sides layout for 100ms to measure which is wider.
  // Then, set this as the `width` of the sides and let the center expand.
  const [measured, setMeasured] = React.useState(false)
  const setMeasuredLater = Kb.useTimeout(() => setMeasured(true), 100)
  const [widerWidth, setWiderWidth] = React.useState(-1)
  const onLayoutSide = React.useCallback(
    (evt: LayoutChangeEvent) => {
      if (measured) {
        return
      }
      const {width} = evt.nativeEvent.layout
      if (width > widerWidth) {
        setWiderWidth(width)
        setMeasuredLater()
      }
    },
    [measured, widerWidth]
  )
  const sideWidth = widerWidth + headerSidePadding * 2
  // end mobile only

  const showTitle = measured || !Styles.isMobile
  const useMeasuredStyles = measured && Styles.isMobile
  return (
    <Kb.Box2
      direction="vertical"
      style={Styles.collapseStyles([
        props.icon ? styles.headerWithIcon : styles.header,
        props.hideBorder && styles.headerHideBorder,
        props.style,
      ])}
      fullWidth={true}
    >
      {!!props.icon && props.icon}
      <Kb.Box2
        direction="horizontal"
        alignItems="center"
        fullHeight={true}
        style={Styles.globalStyles.flexOne}
      >
        {/* Boxes on left and right side of header must exist even if leftButton and rightButton aren't used so title stays centered */}
        <Kb.Box2
          direction="horizontal"
          style={Styles.collapseStyles([styles.headerLeft, useMeasuredStyles && {flex: 0, width: sideWidth}])}
        >
          <Kb.Box2 direction="horizontal" onLayout={onLayoutSide}>
            {!!props.leftButton && props.leftButton}
          </Kb.Box2>
        </Kb.Box2>
        {showTitle && (
          <Kb.Box style={useMeasuredStyles ? styles.measured : undefined}>
            {typeof props.title === 'string' ? (
              <Kb.Text type={Styles.isMobile ? 'BodyBig' : 'Header'} lineClamp={1} center={true}>
                {props.title}
              </Kb.Text>
            ) : (
              props.title
            )}
          </Kb.Box>
        )}
        <Kb.Box2
          direction="horizontal"
          style={Styles.collapseStyles([
            styles.headerRight,
            useMeasuredStyles && {flex: 0, width: sideWidth},
          ])}
        >
          <Kb.Box2 direction="horizontal" onLayout={onLayoutSide}>
            {!!props.rightButton && props.rightButton}
          </Kb.Box2>
        </Kb.Box2>
      </Kb.Box2>
    </Kb.Box2>
  )
}

const Footer = (props: FooterProps & {wide: boolean}) => (
  <Kb.Box2
    centerChildren={true}
    direction="vertical"
    fullWidth={true}
    style={Styles.collapseStyles([
      styles.footer,
      props.wide && !Styles.isMobile && styles.footerWide,
      !props.hideBorder && styles.footerBorder,
      props.style,
    ])}
  >
    {props.content}
  </Kb.Box2>
)

// These must match the `sideWidth` calculation above
const headerSidePadding = Styles.globalMargins.xsmall
const headerPadding = {
  paddingLeft: headerSidePadding,
  paddingRight: headerSidePadding,
}

const styles = Styles.styleSheetCreate(() => {
  const headerCommon = {
    borderBottomColor: Styles.globalColors.black_10,
    borderBottomWidth: 1,
    borderStyle: 'solid' as const,
  }

  return {
    footer: Styles.platformStyles({
      common: {
        ...Styles.padding(Styles.globalMargins.xsmall, Styles.globalMargins.small),
        minHeight: 56,
      },
      isElectron: {
        borderBottomLeftRadius: Styles.borderRadius,
        borderBottomRightRadius: Styles.borderRadius,
        overflow: 'hidden',
      },
    }),
    footerBorder: {
      borderStyle: 'solid',
      borderTopColor: Styles.globalColors.black_10,
      borderTopWidth: 1,
    },
    footerWide: {
      ...Styles.padding(Styles.globalMargins.xsmall, Styles.globalMargins.medium),
    },
    header: {
      ...headerCommon,
      minHeight: 48,
    },
    headerHideBorder: {
      borderBottomWidth: 0,
    },
    headerLeft: {
      ...headerPadding,
      flex: 1,
      justifyContent: 'flex-start',
    },
    headerRight: {
      ...headerPadding,
      flex: 1,
      justifyContent: 'flex-end',
    },
    headerWithIcon: {
      ...headerCommon,
      minHeight: 64,
    },
    measured: {
      alignItems: 'center',
      flex: 1,
      justifyContent: 'center',
    },
    modeDefault: Styles.platformStyles({
      isElectron: {
        maxHeight: 560,
        overflow: 'hidden',
        width: 400,
      },
    }),
    modeWide: Styles.platformStyles({
      isElectron: {
        height: 400,
        overflow: 'hidden',
        width: 560,
      },
    }),
    scrollContentContainer: {...Styles.globalStyles.flexBoxColumn, flexGrow: 1, width: '100%'},
    scrollWide: Styles.platformStyles({
      isElectron: {...Styles.globalStyles.flexBoxColumn, flex: 1, position: 'relative'},
    }),
  }
})

export default Modal
export {Header}
